import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'",
    'https://fonts.googleapis.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'blob:'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com',
    'wss://example.com'
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'block-all-mixed-content': [],
  'upgrade-insecure-requests': []
};

export const withCsp = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      // Build CSP header
      const cspHeader = Object.entries(CSP_DIRECTIVES)
        .map(([key, values]) => {
          if (values.length === 0) return key;
          return `${key} ${values.join(' ')}`;
        })
        .join('; ');

      // Set CSP header
      res.setHeader('Content-Security-Policy', cspHeader);
      
      // Set additional security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

      return handler(req, res);
    } catch (error) {
      logger.error('CSP middleware error', error, req);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در تنظیمات امنیتی',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
}; 