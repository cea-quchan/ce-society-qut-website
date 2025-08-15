import { Redis } from 'ioredis';
import { logger } from './logger';

let redisClient: Redis | null = null;
let connectionAttempted = false;

export function getRedisClient(): Redis | null {
  // Check if Redis is disabled via environment variable
  if (process.env.DISABLE_REDIS === 'true') {
    return null;
  }

  // In development, only attempt connection once
  if (process.env.NODE_ENV === 'development') {
    if (connectionAttempted) {
      return null;
    }
    
    try {
      if (!redisClient) {
        connectionAttempted = true;
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          maxRetriesPerRequest: 0,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 3000,
          commandTimeout: 2000,
        });
        
        // Handle connection errors gracefully
        redisClient.on('error', (err) => {
          logger.warn('Redis connection error:', err.message);
          // In development, don't retry connections
          if (process.env.NODE_ENV === 'development') {
            redisClient = null;
          }
        });
        
        redisClient.on('connect', () => {
          logger.info('Successfully connected to Redis');
        });
        
        redisClient.on('ready', () => {
          logger.info('Redis is ready');
        });
        
        redisClient.on('close', () => {
          logger.warn('Redis connection closed');
          if (process.env.NODE_ENV === 'development') {
            redisClient = null;
          }
        });
      }
      return redisClient;
    } catch (e) {
      logger.warn('Redis is not available in development, returning null.');
      connectionAttempted = true;
      return null;
    }
  } else {
    try {
      if (!redisClient) {
        redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
          enableOfflineQueue: false,
          connectTimeout: 10000,
          commandTimeout: 5000,
        });
        
        // Handle connection errors gracefully
        redisClient.on('error', (err) => {
          logger.warn('Redis connection error:', err.message);
        });
        
        redisClient.on('connect', () => {
          logger.info('Successfully connected to Redis');
        });
        
        redisClient.on('ready', () => {
          logger.info('Redis is ready');
        });
      }
      return redisClient;
    } catch (e) {
      logger.error('Failed to create Redis client:', e);
      return null;
    }
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
      redisClient = null;
      connectionAttempted = false;
    } catch (e) {
      logger.warn('Error closing Redis client:', e);
    }
  }
} 