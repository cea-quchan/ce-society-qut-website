import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import type { ApiResponse } from '@/types/api';

const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>, user?: any) => {
  if (req.method !== 'PUT') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['PUT']);
    res.status(405).json({ success: false, error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' } });
    return;
  }

  try {
    const { id } = req.query;

    logger.info(`Marking notification ${id} as read`, req);

    const notification = await prisma.notification.findUnique({
      where: { id: id as string }
    });

    if (!notification) {
      logger.warn(`Notification ${id} not found`, req);
      res.status(404).json({
        success: false,
        error: {
          message: 'اعلان مورد نظر یافت نشد',
          code: 'NOT_FOUND'
        }
      });
      return;
    }

    if (notification.userId !== user.id && user.role !== 'ADMIN') {
      logger.warn(`User ${user.id} attempted to mark notification ${id} as read without permission`, req);
      res.status(403).json({
        success: false,
        error: {
          message: 'شما دسترسی به این اعلان را ندارید',
          code: 'FORBIDDEN'
        }
      });
      return;
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: id as string },
      data: { read: true }
    });

    logger.info(`Successfully marked notification ${id} as read`, req);
    res.status(200).json({
      success: true,
      data: updatedNotification
    });
    return;
  } catch (error) {
    logger.error('Error marking notification as read', error, req);
    res.status(500).json({
      success: false,
      error: {
        message: 'خطا در بروز رسانی وضعیت اعلان',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
    return;
  }
};

export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 