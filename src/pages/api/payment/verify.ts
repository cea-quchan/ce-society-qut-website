import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import type { ApiResponse } from '@/types/api';

type Handler = (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  if (req.method !== 'POST') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    const { paymentId, status } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'شناسه پرداخت و وضعیت الزامی هستند',
          code: 'BAD_REQUEST'
        }
      });
    }

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId }
    });

    if (!payment) {
      logger.warn(`Payment ${paymentId} not found`, req);
      return res.status(404).json({
        success: false,
        error: {
          message: 'پرداخت مورد نظر یافت نشد',
          code: 'NOT_FOUND'
        }
      });
    }

    // Check if user has permission to verify this payment
    if (payment.userId !== user.id && user.role !== 'ADMIN') {
      logger.warn(`User ${user.id} attempted to verify payment ${paymentId} without permission`, req);
      return res.status(403).json({
        success: false,
        error: {
          message: 'شما دسترسی به تایید این پرداخت را ندارید',
          code: 'FORBIDDEN'
        }
      });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'verified',
      },
    });

    logger.info(`Successfully verified payment ${paymentId}`, req);
    return res.status(200).json({
      success: true,
      data: updatedPayment
    });
  } catch (error) {
    logger.error('Error verifying payment', error, req);
    res.status(500).json({
      success: false,
      error: {
        message: 'خطا در تایید پرداخت',
        code: 'INTERNAL_SERVER_ERROR'
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