import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import type { Payment as PrismaPayment } from '@prisma/client';

export interface PaymentData {
  amount: number;
  userId: string;
  type: 'COURSE_PURCHASE' | 'SUBSCRIPTION' | 'OTHER';
  description?: string;
}

export class PaymentService {
  static async createPayment(data: PaymentData): Promise<{ payment: PrismaPayment; paymentUrl: string }> {
    try {
      const payment = await prisma.payment.create({
        data: {
          amount: data.amount,
          userId: data.userId,
          type: data.type,
          description: data.description,
          status: 'PENDING'
        }
      });

      // در اینجا باید منطق اتصال به درگاه پرداخت پیاده‌سازی شود
      // این یک نمونه ساده است
      const paymentUrl = `https://payment-gateway.com/pay/${payment.id}`;

      return {
        payment,
        paymentUrl
      };
    } catch {
      throw new AppError('خطا در ایجاد پرداخت', 500);
    }
  }

  static async verifyPayment(paymentId: string): Promise<PrismaPayment> {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId }
      });

      if (!payment) {
        throw new AppError('پرداخت یافت نشد', 404);
      }

      // در اینجا باید منطق تایید پرداخت با درگاه پرداخت پیاده‌سازی شود
      // این یک نمونه ساده است
      const verifiedPayment = await prisma.payment.update({
        where: { id: paymentId },
        data: { status: 'SUCCESS' }
      });

      return verifiedPayment;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('خطا در تایید پرداخت', 500);
    }
  }

  static async getPaymentHistory(userId: string): Promise<PrismaPayment[]> {
    try {
      const payments = await prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return payments;
    } catch {
      throw new AppError('خطا در دریافت تاریخچه پرداخت‌ها', 500);
    }
  }
} 