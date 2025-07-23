import type { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';
import { 
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  DatabaseError,
  FileUploadError,
  RateLimitError,
  SocketError,
  CacheError,
  ExternalServiceError
} from '@/lib/errors';
import type { ApiResponse, ErrorMiddleware, ErrorResponse, ErrorCode } from '@/types/api';
import { ZodError } from 'zod';
import { createErrorResponse } from '@/lib/apiResponse';

export const errorHandler = (
  err: unknown,
  req: NextApiRequest,
  res: NextApiResponse,
  next: (err?: unknown) => void
) => {
  logger.error('Error in request handler', err, req);

  const errorResponse = (statusCode: number, response: ErrorResponse) => {
    return res.status(statusCode).json(response);
  };

  if (err instanceof ZodError) {
    return errorResponse(400, {
      success: false,
      error: {
        message: 'داده‌های نامعتبر',
        code: 'VALIDATION_ERROR',
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }
    });
  }

  if (err instanceof ValidationError) {
    return errorResponse(400, {
      success: false,
      error: {
        message: err.message,
        code: 'VALIDATION_ERROR',
        details: err.details?.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        })) || []
      }
    });
  }

  if (err instanceof AuthenticationError) {
    return errorResponse(401, {
      success: false,
      error: {
        message: err.message,
        code: 'UNAUTHORIZED'
      }
    });
  }

  if (err instanceof AuthorizationError) {
    return errorResponse(403, {
      success: false,
      error: {
        message: err.message,
        code: 'FORBIDDEN'
      }
    });
  }

  if (err instanceof NotFoundError) {
    return errorResponse(404, {
      success: false,
      error: {
        message: err.message,
        code: 'NOT_FOUND'
      }
    });
  }

  if (err instanceof DatabaseError || 
      err instanceof FileUploadError || 
      err instanceof RateLimitError || 
      err instanceof SocketError || 
      err instanceof CacheError || 
      err instanceof ExternalServiceError) {
    return errorResponse(500, {
      success: false,
      error: {
        message: err.message,
        code: 'INTERNAL_SERVER_ERROR',
        details: err instanceof ExternalServiceError ? { service: err.service } : undefined
      }
    });
  }

  return errorResponse(500, {
    success: false,
    error: {
      message: err instanceof Error ? err.message : 'خطای سرور',
      code: 'INTERNAL_SERVER_ERROR'
    }
  });
};

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: ErrorCode = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const handleError = (error: unknown): ApiResponse => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: error.code
      }
    };
  }

  if (error instanceof ValidationError) {
    return {
      success: false,
      error: {
        message: error.message,
        code: 'VALIDATION_ERROR',
        details: error.details?.errors
      }
    };
  }

  if (error instanceof ZodError) {
    return {
      success: false,
      error: {
        message: 'داده‌های نامعتبر',
        code: 'VALIDATION_ERROR',
        details: error.errors
      }
    };
  }

  console.error('Unhandled Error:', error);
  return {
    success: false,
    error: {
      message: 'خطای سرور',
      code: 'INTERNAL_SERVER_ERROR'
    }
  };
};

export const withErrorHandler = (
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      errorHandler(error as Error, req, res, () => {});
    }
  };
}; 