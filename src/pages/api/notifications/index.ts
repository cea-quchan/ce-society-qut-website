import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import type { ApiResponse } from '@/types/api';

type Handler = (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching notifications', req);
        const { read, type, search } = req.query;

        const where: any = {
          userId: user.id
        };

        if (read !== undefined) {
          where.read = read === 'true';
        }

        if (type) {
          where.type = type;
        }

        if (search) {
          where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { message: { contains: search as string, mode: 'insensitive' } }
          ];
        }

        const notifications = await prisma.notification.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        logger.info(`Successfully fetched ${notifications.length} notifications`, req);
        res.status(200).json({
          success: true,
          data: notifications
        });
      } catch (error) {
        logger.error('Error fetching notifications', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در دریافت اعلان‌ها',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        logger.info('Creating new notification', req);
        const { title, message, type, userId } = req.body;

        // Only allow admin users to create notifications
        if (user.role !== 'ADMIN') {
          logger.warn(`User ${user.id} attempted to create notification without permission`, req);
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به ایجاد اعلان را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        if (!title || !message || !type || !userId) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'تمام فیلدها الزامی هستند',
              code: 'BAD_REQUEST'
            }
          });
        }

        const notification = await prisma.notification.create({
          data: {
            title,
            message,
            type,
            userId,
            read: false
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        });

        logger.info(`Successfully created notification with ID: ${notification.id}`, req);
        res.status(201).json({
          success: true,
          data: notification
        });
      } catch (error) {
        logger.error('Error creating notification', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در ایجاد اعلان',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'PUT':
      try {
        logger.info('Marking all notifications as read', req);
        const { type } = req.query;

        const where: any = {
          userId: user.id,
          read: false
        };

        if (type) {
          where.type = type;
        }

        await prisma.notification.updateMany({
          where,
          data: {
            read: true
          }
        });

        logger.info('Successfully marked all notifications as read', req);
        res.status(200).json({
          success: true,
          data: null
        });
      } catch (error) {
        logger.error('Error marking notifications as read', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در بروزرسانی وضعیت اعلان‌ها',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).json({
        success: false,
        error: {
          message: `Method ${req.method} Not Allowed`,
          code: 'METHOD_NOT_ALLOWED'
        }
      });
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 