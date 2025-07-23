import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

const paramsSchema = z.object({
  id: z.string().min(1, 'شناسه اعلان الزامی است')
});

// Remove explicit Handler type and use default Next.js API handler signature
const handler = async (req: NextApiRequest, res: NextApiResponse<ApiResponse<null>>, user?: any) => {
  if (req.method !== 'DELETE') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['DELETE']);
    res.status(405).json({ success: false, error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' } });
    return;
  }

  try {
    const { id } = req.query;
    logger.info(`Deleting notification ${id}`, req);

    // Validate notification ID
    const validationResult = paramsSchema.safeParse({ id });
    if (!validationResult.success) {
      res.status(400).json({
        success: false,
        error: {
          message: 'شناسه اعلان نامعتبر است',
          code: 'BAD_REQUEST',
          details: validationResult.error.errors
        }
      });
      return;
    }

    // Check if notification exists and belongs to user
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
      logger.warn(`User ${user.id} attempted to delete notification ${id} without permission`, req);
      res.status(403).json({
        success: false,
        error: {
          message: 'شما دسترسی به حذف این اعلان را ندارید',
          code: 'FORBIDDEN'
        }
      });
      return;
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id: id as string }
    });

    logger.info(`Successfully deleted notification ${id}`, req);
    res.status(200).json({
      success: true,
      data: null
    });
    return;
  } catch (error) {
    logger.error('Error deleting notification', error, req);
    res.status(500).json({
      success: false,
      error: {
        message: 'خطا در حذف اعلان',
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