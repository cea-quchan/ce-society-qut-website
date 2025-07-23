import { NextApiRequest, NextApiResponse } from 'next';
import { logger } from '@/lib/logger';

// Extend NextApiResponse to include additional properties
interface ExtendedNextApiResponse extends NextApiResponse {
  end: (chunk?: any, encoding?: any, callback?: any) => this;
  statusCode: number;
  setHeader: (name: string, value: string | number | string[]) => this;
}

// Logging middleware
export const withLogging = (handler: any) => {
  return async (req: NextApiRequest, res: ExtendedNextApiResponse) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(7);

    // Log request
    logger.info('Request started', {
      requestId,
      method: req.method,
      url: req.url,
      query: req.query,
      headers: {
        'user-agent': req.headers['user-agent'],
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip']
      }
    });

    // Add request ID to response headers
    res.setHeader('X-Request-ID', requestId);

    // Capture response
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any, callback?: any) {
      const duration = Date.now() - start;

      // Log response
      logger.info('Request completed', {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });

      // Call original end
      return originalEnd.call(this, chunk, encoding, callback);
    };

    try {
      await handler(req, res);
    } catch (error) {
      // Log error
      logger.error('Request failed', {
        requestId,
        method: req.method,
        url: req.url,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });

      throw error;
    }
  };
};

// Error logging middleware
export const withErrorLogging = (handler: any) => {
  return async (req: NextApiRequest, res: ExtendedNextApiResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      // Log error
      logger.error('Unhandled error', {
        method: req.method,
        url: req.url,
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack
        } : error
      });

      // Send error response
      res.status(500).json({
        success: false,
        error: {
          message: 'خطای سرور',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
}; 