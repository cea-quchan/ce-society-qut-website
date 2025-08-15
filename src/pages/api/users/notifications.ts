import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import { z } from 'zod';
import { withApiMiddleware } from '@/middleware';
import {
  createApiResponse,
  createUnauthorizedResponse,
  createErrorResponse,
  createValidationErrorResponse
} from '@/lib/apiResponse';

// Validation schemas
const getNotificationsSchema = z.object({
  page: z.string().optional().transform(val => Number(val) || 1),
  limit: z.string().optional().transform(val => Number(val) || 10)
});

const updateNotificationsSchema = z.object({
  notificationIds: z.array(z.string()).min(1, 'حداقل یک شناسه اعلان باید انتخاب شود')
});

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: Date;
}

interface NotificationsData {
  notifications: Notification[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface UpdateNotificationsData {
  updatedCount: number;
}

export default withApiMiddleware(async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json(createUnauthorizedResponse('لطفا وارد حساب کاربری خود شوید'));
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { page, limit } = getNotificationsSchema.parse(req.query);
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
          prisma.notification.findMany({
            where: {
              userId: session.user.id
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: limit,
            select: {
              id: true,
              title: true,
              message: true,
              type: true,
              read: true,
              link: true,
              createdAt: true
            }
          }),
          prisma.notification.count({
            where: {
              userId: session.user.id
            }
          })
        ]);

        const data: NotificationsData = {
          notifications,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };

        return res.status(200).json(createApiResponse(data));
      }

      case 'PUT': {
        const { notificationIds } = updateNotificationsSchema.parse(req.body);

        const updatedCount = await prisma.notification.updateMany({
          where: {
            id: {
              in: notificationIds
            },
            userId: session.user.id
          },
          data: {
            read: true
          }
        });

        if (updatedCount.count === 0) {
          throw new AppError('هیچ اعلانی یافت نشد', 404);
        }

        const data: UpdateNotificationsData = {
          updatedCount: updatedCount.count
        };

        return res.status(200).json(createApiResponse(
          data,
          'اعلان‌ها با موفقیت به‌روزرسانی شدند'
        ));
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json(createErrorResponse(
          `Method ${req.method} Not Allowed`,
          'METHOD_NOT_ALLOWED'
        ));
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createValidationErrorResponse(
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      ));
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(createErrorResponse(
        error.message,
        error.code
      ));
    }

    console.error('Notification API Error:', error);
    return res.status(500).json(createErrorResponse(
      'خطای سرور',
      'INTERNAL_SERVER_ERROR'
    ));
  }
}); 