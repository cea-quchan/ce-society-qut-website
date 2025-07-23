import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { prisma } from "@/lib/prisma";

export async function withNotificationAuth(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>,
  handler: (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>, userId: string) => Promise<void>
) {
  try {
    const session = await getServerSession(req, res, authOptions);
    
    if (!session) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'لطفا وارد حساب کاربری خود شوید',
          code: 'UNAUTHORIZED'
        }
      });
    }

    return handler(req, res, session.user.id);
  } catch (error) {
    logger.error('Error in notification auth middleware', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'خطا در احراز هویت',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

export async function validateNotificationAccess(
  notificationId: string,
  userId: string
): Promise<boolean> {
  try {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId }
    });

    if (!notification) {
      return false;
    }

    return notification.userId === userId;
  } catch (error) {
    logger.error('Error validating notification access', error);
    return false;
  }
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  try {
    return await prisma.notification.count({
      where: {
        userId,
        read: false
      }
    });
  } catch (error) {
    logger.error('Error getting unread notification count', error);
    return 0;
  }
}

export async function withNotification(handler: ApiHandler) {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session) {
        return res.status(401).json({
          success: false,
          error: {
            message: 'لطفا وارد حساب کاربری خود شوید',
            code: 'UNAUTHORIZED'
          }
        });
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Error in notification middleware', error, req);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در پردازش درخواست',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
} 