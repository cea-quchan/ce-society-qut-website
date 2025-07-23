import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { ApiResponse } from '@/types/api';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { logger } from '@/lib/logger';

type Role = 'USER' | 'ADMIN' | 'INSTRUCTOR';

// Auth middleware configuration
interface AuthConfig {
  required?: boolean;
  roles?: Role[];
  message?: string;
}

// Default configuration
const defaultConfig: AuthConfig = {
  required: true,
  roles: [],
  message: 'لطفا وارد حساب کاربری خود شوید'
};

// Auth middleware
export const withAuth = <T>(handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>, user?: any) => Promise<void>, config: Partial<AuthConfig> = {}) => {
  const finalConfig = { ...defaultConfig, ...config };

  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<T>>) => {
    try {
      const session = await getSession({ req });

      // Check if authentication is required
      if (finalConfig.required && !session) {
        logger.warn('Authentication required', {
          path: req.url,
          method: req.method
        });

        return res.status(401).json({
          success: false,
          error: {
            message: finalConfig.message || 'لطفا وارد حساب کاربری خود شوید',
            code: 'UNAUTHORIZED'
          }
        });
      }

      // Check role-based authorization
      if (finalConfig.roles && finalConfig.roles.length > 0) {
        const userRole = session?.user?.role as Role;
        
        if (!userRole || !finalConfig.roles.includes(userRole)) {
          logger.warn('Authorization failed', {
            path: req.url,
            method: req.method,
            userRole,
            requiredRoles: finalConfig.roles
          });

          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به این عملیات را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }
      }

      // Add user to request object
      (req as any).user = session?.user;

      return handler(req, res);
    } catch (error) {
      logger.error('Auth middleware error', error);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در بررسی احراز هویت',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
};

// Role-based middleware helpers
export const withAdmin = (handler: any) => withAuth(handler, { roles: ['ADMIN'] });
export const withInstructor = (handler: any) => withAuth(handler, { roles: ['INSTRUCTOR'] });
export const withUser = (handler: any) => withAuth(handler, { roles: ['USER'] });
export const withOptionalAuth = (handler: any) => withAuth(handler, { required: false }); 