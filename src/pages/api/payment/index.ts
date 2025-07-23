import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { ApiResponse, ErrorCode } from '@/types/api';

type PaymentData = {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type Handler = (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching payments', req);
        const payments = await prisma.payment.findMany({
          where: {
            userId: user.id
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        logger.info(`Successfully fetched ${payments.length} payments`, req);
        res.status(200).json({
          success: true,
          data: payments
        });
      } catch (error) {
        logger.error('Error fetching payments', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در دریافت پرداخت‌ها',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        logger.info('Creating new payment', req);
        const { amount, type, description } = req.body;

        if (!amount || !type) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'مبلغ و نوع پرداخت الزامی هستند',
              code: 'BAD_REQUEST'
            }
          });
        }

        const payment = await prisma.payment.create({
          data: {
            amount,
            type,
            description,
            userId: user.id,
            status: 'pending'
          }
        });

        // Generate payment URL (implement your payment gateway integration here)
        const paymentUrl = `/payment/verify/${payment.id}`;

        logger.info(`Successfully created payment with ID: ${payment.id}`, req);
        res.status(201).json({
          success: true,
          data: {
            payment,
            paymentUrl
          }
        });
      } catch (error) {
        logger.error('Error creating payment', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در ایجاد پرداخت',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST']);
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