import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { withValidation } from '@/middleware/validation';
import { withLogger } from '@/middleware/logger';
import { withErrorHandler } from '@/middleware/error';
import type { ApiResponse, ApiHandler, Middleware, ErrorMiddleware } from '@/types/api';
import { z } from 'zod';

const applyMiddleware = async (
  middleware: Middleware | ErrorMiddleware,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>,
  error?: Error
): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (error && 'length' in middleware) {
      (middleware as ErrorMiddleware)(error, req, res, () => {
        resolve();
      });
    } else {
      (middleware as Middleware)(req, res, () => {
        resolve();
      });
    }
  });
};

// Create a middleware chain
export const withApiMiddleware = <T>(handler: ApiHandler<T>, schema?: z.ZodSchema) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      await withLogger(req, res, () => {});
      await withSecurity<T>(handler)(req, res);
      await withRateLimit<T>(handler)(req, res);
      await withAuth<T>(handler)(req, res);
      if (schema) {
        await withValidation(schema, handler)(req, res);
      }
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطای سرور',
          code: 'INTERNAL_SERVER_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  };
};

// Create a public middleware chain (without auth)
export const withPublicMiddleware = (handler: ApiHandler, schema?: z.ZodSchema) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      await withLogger(req, res, () => {});
      await withSecurity(handler)(req, res);
      await withRateLimit(handler)(req, res);
      if (schema) {
        await withValidation(schema, handler)(req, res);
      }
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطای سرور',
          code: 'INTERNAL_SERVER_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  };
};

// Create an admin middleware chain
export const withAdminMiddleware = (handler: ApiHandler, schema?: z.ZodSchema) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      await withLogger(req, res, () => {});
      await withSecurity(handler)(req, res);
      await withRateLimit(handler)(req, res);
      await withAuth(handler)(req, res);
      if (schema) {
        await withValidation(schema, handler)(req, res);
      }
      if ((req as any).user?.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'شما دسترسی به این بخش را ندارید',
            code: 'FORBIDDEN'
          }
        });
      }
      await handler(req, res);
    } catch (error) {
      console.error('API Error:', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطای سرور',
          code: 'INTERNAL_SERVER_ERROR',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    }
  };
};

// Export all middleware functions
export * from './auth';
export * from './rateLimit';
export * from './validation';
export * from './logging';

// Middleware composition helper
export type MiddlewareFunction = (handler: ApiHandler) => ApiHandler;

export const compose = (...middlewares: MiddlewareFunction[]) => {
  return (handler: ApiHandler): ApiHandler => {
    return middlewares.reduceRight((prev, middleware) => {
      return middleware(prev);
    }, handler);
  };
};

// Example usage:
// const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse>) => {
//   // Your API handler logic here
// };
//
// export default compose(
//   withLogging,
//   withErrorLogging,
//   withRateLimit,
//   withAuth,
//   withValidation(schema)
// )(handler); 