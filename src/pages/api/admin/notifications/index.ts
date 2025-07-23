import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';
import {
  createApiResponse,
  createUnauthorizedResponse,
  createErrorResponse,
  createValidationErrorResponse
} from '@/lib/apiResponse';

// Validation schemas
const createNotificationSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است').max(200, 'عنوان نمی‌تواند بیشتر از 200 کاراکتر باشد'),
  message: z.string().min(1, 'متن پیام الزامی است').max(1000, 'متن پیام نمی‌تواند بیشتر از 1000 کاراکتر باشد'),
  type: z.enum(['info', 'success', 'warning', 'error']),
  targetAudience: z.enum(['all', 'students', 'teachers', 'admins', 'specific']),
  userIds: z.array(z.string()).optional(),
  scheduledFor: z.string().optional(),
});

const getNotificationsSchema = z.object({
  page: z.string().optional().transform(val => Number(val) || 1),
  limit: z.string().optional().transform(val => Number(val) || 20),
  type: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

const bulkOperationSchema = z.object({
  ids: z.array(z.string()).min(1, 'حداقل یک شناسه باید انتخاب شود'),
  action: z.enum(['delete', 'markAsRead', 'markAsUnread', 'resend']).optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json(createUnauthorizedResponse('لطفا وارد حساب کاربری خود شوید'));
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json(createErrorResponse('شما دسترسی به این بخش را ندارید', 'FORBIDDEN'));
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { page, limit, type, status, search, startDate, endDate } = getNotificationsSchema.parse(req.query);
        const skip = (page - 1) * limit;

        const where: any = {};

        if (type && type !== 'all') {
          where.type = type;
        }

        if (status && status !== 'all') {
          where.status = status;
        }

        if (search) {
          where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { message: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (startDate || endDate) {
          where.createdAt = {};
          if (startDate) where.createdAt.gte = new Date(startDate);
          if (endDate) where.createdAt.lte = new Date(endDate);
        }

        const [notifications, total] = await Promise.all([
          prisma.notification.findMany({
            where,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: limit,
          }),
          prisma.notification.count({ where })
        ]);

        // Calculate basic analytics
        const totalSent = await prisma.notification.count({ where: { read: true } });
        const totalUnread = await prisma.notification.count({ where: { read: false } });

        const data = {
          notifications,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          },
          analytics: {
            totalSent,
            totalUnread,
            totalNotifications: total,
          }
        };

        return res.status(200).json(createApiResponse(data));
      }

      case 'POST': {
        const { title, message, type, targetAudience, userIds, scheduledFor } = createNotificationSchema.parse(req.body);

        let targetUsers: string[] = [];

        // Determine target users based on audience
        switch (targetAudience) {
          case 'all':
            const allUsers = await prisma.user.findMany({
              select: { id: true }
            });
            targetUsers = allUsers.map(u => u.id);
            break;
          case 'students':
            const students = await prisma.user.findMany({
              where: { role: 'student' },
              select: { id: true }
            });
            targetUsers = students.map(u => u.id);
            break;
          case 'teachers':
            const teachers = await prisma.user.findMany({
              where: { role: 'teacher' },
              select: { id: true }
            });
            targetUsers = teachers.map(u => u.id);
            break;
          case 'admins':
            const admins = await prisma.user.findMany({
              where: { role: 'ADMIN' },
              select: { id: true }
            });
            targetUsers = admins.map(u => u.id);
            break;
          case 'specific':
            if (!userIds || userIds.length === 0) {
              throw new AppError('برای ارسال به کاربران خاص، حداقل یک کاربر باید انتخاب شود', 400);
            }
            targetUsers = userIds;
            break;
        }

        if (targetUsers.length === 0) {
          throw new AppError('هیچ کاربری برای ارسال اعلان یافت نشد', 400);
        }

        const status = scheduledFor ? 'scheduled' : 'sent';
        const scheduledDate = scheduledFor ? new Date(scheduledFor) : null;

        // Create notifications for all target users
        const notifications = await prisma.notification.createMany({
          data: targetUsers.map(userId => ({
            title,
            message,
            type,
            userId,
          }))
        });

        const data = {
          createdCount: notifications.count,
          targetUsers: targetUsers.length,
          status,
          scheduledFor: scheduledDate,
        };

        return res.status(201).json(createApiResponse(
          data,
          `اعلان با موفقیت برای ${targetUsers.length} کاربر ارسال شد`
        ));
      }

      case 'PUT': {
        const { ids, action } = bulkOperationSchema.parse(req.body);

        let result;

        switch (action) {
          case 'markAsRead':
            result = await prisma.notification.updateMany({
              where: { id: { in: ids } },
              data: { read: true }
            });
            break;
          case 'markAsUnread':
            result = await prisma.notification.updateMany({
              where: { id: { in: ids } },
              data: { read: false }
            });
            break;
          case 'resend':
            result = await prisma.notification.updateMany({
              where: { id: { in: ids } },
              data: { createdAt: new Date() }
            });
            break;
          default:
            throw new AppError('عملیات نامعتبر', 400);
        }

        const data = {
          updatedCount: result.count,
          action,
        };

        return res.status(200).json(createApiResponse(
          data,
          `${result.count} اعلان با موفقیت به‌روزرسانی شد`
        ));
      }

      case 'DELETE': {
        const { ids } = bulkOperationSchema.parse(req.body);

        const result = await prisma.notification.deleteMany({
          where: { id: { in: ids } }
        });

        const data = {
          deletedCount: result.count,
        };

        return res.status(200).json(createApiResponse(
          data,
          `${result.count} اعلان با موفقیت حذف شد`
        ));
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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

    console.error('Admin Notifications API Error:', error);
    return res.status(500).json(createErrorResponse(
      'خطای سرور',
      'INTERNAL_SERVER_ERROR'
    ));
  }
} 