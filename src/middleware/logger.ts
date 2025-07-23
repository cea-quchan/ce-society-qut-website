import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse } from '@/types/api';
import { logger } from '@/lib/logger';

export const withLogger = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>,
  next: () => void
) => {
  const start = Date.now();

  try {
    // Log request
    logger.info('API Request', {
      method: req.method,
      url: req.url,
      user: req.user?.id
    });

    // Call next middleware
    await next();

    // Log response
    const duration = Date.now() - start;
    logger.info('API Response', {
      method: req.method,
      url: req.url,
      status: (res as any).statusCode,
      duration,
      user: req.user?.id
    });

  } catch (error) {
    // Log errors
    const duration = Date.now() - start;
    logger.error('API Error', {
      method: req.method,
      url: req.url,
      status: (res as any).statusCode,
      duration,
      user: req.user?.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    });

    throw error;
  }
}; 