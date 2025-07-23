import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import { sanitizeHtml } from '@/lib/sanitize';
import helmet from 'helmet';
import { AppError } from './error';

// Comment out or remove limiter and withRateLimiting, and add a comment that for Next.js, use a Next.js-compatible rate limiter instead of express-rate-limit.

// Security headers
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' data: https:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    block-all-mixed-content;
    upgrade-insecure-requests;
  `.replace(/\s+/g, ' ').trim(),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
};

// Input sanitization
const sanitizeInput = (input: string): string => {
  return input
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove on* attributes
    .trim();
};

// Request validation
const validateRequest = (req: NextApiRequest): void => {
  const { method, url, headers } = req;

  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip'];
  for (const header of suspiciousHeaders) {
    if (headers[header]) {
      throw new AppError('درخواست نامعتبر', 400, 'INVALID_REQUEST');
    }
  }

  // Validate URL
  if (url && !/^[a-zA-Z0-9\-._~:/?#[\]@!$&'()*+,;=]+$/.test(url)) {
    throw new AppError('URL نامعتبر', 400, 'INVALID_URL');
  }

  // Validate method
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
  if (!allowedMethods.includes(method || '')) {
    throw new AppError('متد نامعتبر', 405, 'INVALID_METHOD');
  }
};

// Sanitize object recursively
const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
};

// Security middleware
export const withSecurity = <T>(handler: ApiHandler<T>) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      // Sanitize query parameters
      if (req.query) {
        req.query = sanitizeObject(req.query);
      }

      // Sanitize body
      if (req.body) {
        req.body = sanitizeObject(req.body);
      }

      // Add security headers
      Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });

      await handler(req, res);
    } catch (error) {
      logger.error('Security middleware error:', error);
      throw error;
    }
  };
};

// Export individual security functions for specific use cases
export const withHelmet = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      // Apply security headers directly instead of using helmet
      Object.entries(securityHeaders).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
      return handler(req, res);
    } catch (error) {
      logger.error('Helmet middleware error', error, req);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در تنظیمات امنیتی',
          code: 'HELMET_ERROR'
        }
      });
    }
  };
};

// Comment out or remove limiter and withRateLimiting, and add a comment that for Next.js, use a Next.js-compatible rate limiter instead of express-rate-limit. 