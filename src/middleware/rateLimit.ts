import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import { Redis } from 'ioredis';
import { getRedisClient } from '@/lib/redis';

interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyPrefix?: string;
}

const defaultConfig: RateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  keyPrefix: 'rate_limit:'
};

export function withRateLimit<T>(handler: ApiHandler<T>, config: Partial<RateLimitConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };
  let redis: Redis | null = null;
  try {
    redis = getRedisClient();
  } catch (e) {
    redis = null;
  }

  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    if (!redis) {
      // اگر Redis در دسترس نبود (مثلاً در محیط dev)، rate limit را نادیده بگیر و ادامه بده
      logger.warn('Redis is not available, skipping rate limiting for all requests.');
      return handler(req, res);
    }
    try {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      const key = `${finalConfig.keyPrefix}${ip}`;

      const current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, finalConfig.windowMs / 1000);
      }

      if (current > finalConfig.max) {
        logger.warn(`Rate limit exceeded for IP: ${ip}`, req);
        return res.status(429).json({
          success: false,
          error: {
            message: 'تعداد درخواست‌های شما بیش از حد مجاز است',
            code: 'RATE_LIMIT_EXCEEDED'
          }
        });
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Rate limit middleware error:', error);
      // اگر خطای Redis بود، rate limit را نادیده بگیر و ادامه بده
      return handler(req, res);
    }
  };
}

export const cleanupRateLimits = async () => {
  const redis = getRedisClient();
  if (!redis) {
    logger.warn('Redis is not available for cleanup');
    return;
  }
  try {
    const keys = await redis.keys(`${defaultConfig.keyPrefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    logger.error('Rate limit cleanup error:', error);
  }
}; 