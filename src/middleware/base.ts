import { createRouter } from 'next-connect';
import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse } from '@/types/api';
import { 
  ErrorResponse, 
  ErrorCode,
  ValidationErrorResponse,
  UnauthorizedResponse,
  ForbiddenResponse,
  NotFoundResponse,
  InternalServerErrorResponse,
  ApiHandler
} from '@/types/api';
import { logger } from '@/lib/logger';
import { withApiMiddleware } from './index';
import { ZodError } from 'zod';
import { ServerResponse } from 'http';

// Error handler middleware
const errorHandler = (
  err: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
  next: (err?: unknown) => void
): void => {
  logger.error('API Error:', err, req);
  
  if (err instanceof ZodError) {
    const response: ValidationErrorResponse = {
      success: false,
      error: {
        message: 'Validation error',
        code: 'VALIDATION_ERROR',
        details: err.errors
      }
    };
    res.status(400).json(response);
    return;
  }

  if (err instanceof Error) {
    const response: InternalServerErrorResponse = {
      success: false,
      error: {
        message: err.message || 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? err.stack : undefined
      }
    };
    res.status(500).json(response);
    return;
  }

  const response: InternalServerErrorResponse = {
    success: false,
    error: {
      message: 'Internal server error',
      code: 'INTERNAL_SERVER_ERROR'
    }
  };
  res.status(500).json(response);
};

// Method not allowed handler
export const methodNotAllowed = (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({
    success: false,
    error: {
      message: `متد ${req.method} مجاز نیست`,
      code: 'METHOD_NOT_ALLOWED'
    }
  });
};

// Create base router with error handling
export const createBaseRouter = () => {
  const router = createRouter<NextApiRequest, NextApiResponse>();
  
  router.use((req, res, next) => {
    try {
      next();
    } catch (error) {
      errorHandler(error, req, res, next);
    }
  });
  
  router.all((req, res) => methodNotAllowed(req, res));
  return router;
};

// Response wrapper
export const wrapResponse = (
  res: NextApiResponse,
  data: any,
  message?: string
): void => {
  const response: ApiResponse<any> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
  res.status(200).json(response);
};

// Error wrapper
export const wrapError = (
  res: NextApiResponse,
  error: { message: string; code?: ErrorCode; details?: unknown },
  status = 500
): void => {
  const code = error.code || 'INTERNAL_SERVER_ERROR';
  let response: ErrorResponse;

  switch (code) {
    case 'VALIDATION_ERROR':
      response = {
        success: false,
        error: {
          message: error.message,
          code,
          details: error.details
        }
      } as ValidationErrorResponse;
      break;
    case 'UNAUTHORIZED':
      response = {
        success: false,
        error: {
          message: error.message,
          code
        }
      } as UnauthorizedResponse;
      break;
    case 'FORBIDDEN':
      response = {
        success: false,
        error: {
          message: error.message,
          code
        }
      } as ForbiddenResponse;
      break;
    case 'NOT_FOUND':
      response = {
        success: false,
        error: {
          message: error.message,
          code
        }
      } as NotFoundResponse;
      break;
    default:
      response = {
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_SERVER_ERROR',
          details: error.details
        }
      } as InternalServerErrorResponse;
  }

  res.status(status).json(response);
};

// Route handler wrapper
export const withErrorHandling = (handler: ApiHandler) => {
  const router = createRouter<NextApiRequest, NextApiResponse>();
  
  router.use((req, res, next) => {
    try {
      next();
    } catch (error) {
      errorHandler(error, req, res, next);
    }
  });
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error, req, res, () => {});
    }
  };
}; 