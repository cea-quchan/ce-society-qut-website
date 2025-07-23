import { Redis } from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (process.env.NODE_ENV === 'development') {
    try {
      if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      }
      return redisClient;
    } catch (e) {
      logger.warn('Redis is not available in development, returning null.');
      // @ts-ignore
      return null;
    }
  } else {
    if (!redisClient) {
      redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    }
    return redisClient;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
} 