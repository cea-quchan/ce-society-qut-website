import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';

export interface NotificationData {
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  link?: string;
}

export class NotificationService {
  static async createNotification(data: NotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          type: data.type
        }
      });

      return notification;
    } catch {
      throw new AppError('خطا در ایجاد اعلان', 500);
    }
  }

  static async createBulkNotifications(data: NotificationData[]) {
    try {
      const notifications = await prisma.notification.createMany({
        data: data.map(item => ({
          userId: item.userId,
          title: item.title,
          message: item.message,
          type: item.type
        }))
      });

      return notifications;
    } catch {
      throw new AppError('خطا در ایجاد اعلان‌ها', 500);
    }
  }

  static async markAsRead(notificationIds: string[], userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          id: {
            in: notificationIds
          },
          userId
        },
        data: {
          read: true
        }
      });

      return result;
    } catch {
      throw new AppError('خطا در به‌روزرسانی اعلان‌ها', 500);
    }
  }

  static async deleteNotification(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.findUnique({
        where: {
          id: notificationId
        }
      });

      if (!notification) {
        throw new AppError('اعلان یافت نشد', 404);
      }

      if (notification.userId !== userId) {
        throw new AppError('شما دسترسی به این اعلان را ندارید', 403);
      }

      await prisma.notification.delete({
        where: {
          id: notificationId
        }
      });

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('خطا در حذف اعلان', 500);
    }
  }
} 