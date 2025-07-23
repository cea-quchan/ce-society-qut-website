import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { ErrorCode, PaginatedResponse } from '@/types/api';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';

const dateRangeSchema = z.object({
  startDate: z.string().datetime('تاریخ شروع نامعتبر است'),
  endDate: z.string().datetime('تاریخ پایان نامعتبر است')
});

type LogEntry = {
  id: string;
  level: string;
  message: string;
  timestamp: Date;
  metadata?: any;
};

async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  try {
    const { page = '1', limit = '10', level, startDate, endDate } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (level) where.level = level;
    if (startDate && endDate) {
      where.timestamp = {
        gte: new Date(startDate as string),
        lte: new Date(endDate as string)
      };
    }

    const [logs, total] = await Promise.all([
      prisma.logEntry.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { timestamp: 'desc' }
      }),
      prisma.logEntry.count({ where })
    ]);

    const response: PaginatedResponse<LogEntry> = {
      success: true,
      data: {
        items: logs,
        pagination: {
          total,
          currentPage: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(total / Number(limit))
        }
      },
      timestamp: new Date().toISOString()
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error fetching logs', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching logs',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
}

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 