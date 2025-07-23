import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_COOKIE_NAME = 'csrf_token';

export const withCsrf = (handler: ApiHandler) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        logger.warn('CSRF check failed: No session token', req);
        return res.status(401).json({
          success: false,
          error: {
            message: 'لطفا وارد حساب کاربری خود شوید',
            code: 'UNAUTHORIZED'
          }
        });
      }

      const csrfToken = req.headers[CSRF_TOKEN_HEADER];
      const cookieToken = req.cookies[CSRF_COOKIE_NAME];

      if (!csrfToken || !cookieToken || csrfToken !== cookieToken) {
        logger.warn('CSRF token validation failed', req);
        return res.status(403).json({
          success: false,
          error: {
            message: 'توکن CSRF نامعتبر است',
            code: 'FORBIDDEN'
          }
        });
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Error in CSRF middleware', error, req);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در بررسی CSRF',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
};

// Helper function to generate CSRF token
export const generateCsrfToken = () => {
  return Math.random().toString(36).substring(2);
};

// Helper function to set CSRF token in response
export const setCsrfToken = (res: NextApiResponse<ApiResponse<any>>) => {
  const token = generateCsrfToken();
  res.setHeader('Set-Cookie', `${CSRF_COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict`);
  return token;
}; 