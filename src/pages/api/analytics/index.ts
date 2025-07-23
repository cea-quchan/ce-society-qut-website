import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().datetime('تاریخ شروع نامعتبر است'),
  endDate: z.string().datetime('تاریخ پایان نامعتبر است')
});

type Handler = (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  // Only allow admin users to access analytics
  if (user.role !== 'ADMIN') {
    logger.warn(`User ${user.id} attempted to access analytics without permission`, req);
    return res.status(403).json({ 
      success: false,
      error: {
        message: 'شما دسترسی به آمار را ندارید',
        code: 'FORBIDDEN'
      }
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching analytics data', req);
        const { startDate, endDate } = req.query;

        // Validate date range
        const validationResult = dateRangeSchema.safeParse({ startDate, endDate });
        if (!validationResult.success) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'داده‌های نامعتبر',
              code: 'VALIDATION_ERROR',
            details: validationResult.error.errors 
            }
          });
        }

        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        // Get user statistics
        const userStats = await prisma.user.groupBy({
          by: ['role'],
          _count: true,
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get event statistics
        const eventStats = await prisma.event.groupBy({
          by: ['organizerId'],
          _count: true,
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get article statistics
        const articleStats = await prisma.article.groupBy({
          by: ['authorId'],
          _count: true,
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get comment statistics
        const commentCount = await prisma.comment.count({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get like statistics
        const likeCount = await prisma.like.count({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get participant statistics
        const participantStats = await prisma.eventParticipant.groupBy({
          by: ['status'],
          _count: true,
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        // Get media statistics
        const mediaCount = await prisma.media.count({
          where: {
            createdAt: {
              gte: start,
              lte: end
            }
          }
        });

        const analytics = {
          users: userStats,
          events: eventStats,
          articles: articleStats,
          comments: commentCount,
          likes: likeCount,
          participants: participantStats,
          media: mediaCount
        };

        logger.info('Successfully fetched analytics data', req);
        res.status(200).json({ success: true, data: analytics, message: 'آمار دریافت شد' });
      } catch (error) {
        logger.error('Error fetching analytics data', error, req);
        res.status(500).json({ success: false, error: { message: 'خطا در دریافت آمار', code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      (res as any).setHeader('Allow', ['GET']);
      return res.status(405).json({
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