import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

const reportSchema = z.object({
  type: z.enum(['user', 'event', 'article', 'comment']),
  targetId: z.string().min(1, 'شناسه هدف الزامی است'),
  reason: z.string()
    .min(1, 'دلیل گزارش الزامی است')
    .max(500, 'دلیل گزارش نمی‌تواند بیشتر از 500 کاراکتر باشد'),
  details: z.string().max(1000, 'جزئیات نمی‌تواند بیشتر از 1000 کاراکتر باشد').optional()
});

type Handler = (req: any, res: any, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching reports', req);
        const { type, status, search } = req.query;

        // Only allow admin users to view all reports
        if (user.role !== 'ADMIN') {
          logger.warn(`User ${user.id} attempted to view reports without permission`, req);
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به گزارش‌ها را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const where: any = {};
        if (type) where.type = type;
        if (status) where.status = status;
        if (search) {
          where.OR = [
            { reason: { contains: search as string, mode: 'insensitive' } },
            { details: { contains: search as string, mode: 'insensitive' } }
          ];
        }

        const reports = await prisma.report.findMany({
          where,
          include: {
            reporter: {
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

        logger.info(`Successfully fetched ${reports.length} reports`, req);
        return res.status(200).json({ success: true, data: reports });
      } catch (error) {
        logger.error('Error fetching reports', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در دریافت گزارش‌ها',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        logger.info('Creating new report', req);
        const reportData = req.body;

        // Validate request body
        const validationResult = reportSchema.safeParse(reportData);
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

        // Check if user has already reported this target
        const existingReport = await prisma.report.findFirst({
          where: {
            type: reportData.type,
            targetId: reportData.targetId,
            reporterId: user.id
          }
        });

        if (existingReport) {
          logger.warn(`User ${user.id} already reported ${reportData.type} ${reportData.targetId}`, req);
          return res.status(400).json({
            success: false,
            error: {
              message: 'شما قبلاً این مورد را گزارش کرده‌اید',
              code: 'BAD_REQUEST'
            }
          });
        }

        const report = await prisma.report.create({
          data: {
            ...reportData,
            reporterId: user.id,
            status: 'pending'
          },
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        });

        logger.info(`Successfully created report with ID: ${report.id}`, req);
        return res.status(201).json({ success: true, data: report });
      } catch (error) {
        logger.error('Error creating report', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در ایجاد گزارش',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'PUT':
      try {
        const { id } = req.query;
        logger.info(`Updating report ${id}`, req);

        if (!id) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'شناسه گزارش الزامی است',
              code: 'BAD_REQUEST'
            }
          });
        }

        // Only allow admin users to update reports
        if (user.role !== 'ADMIN') {
          logger.warn(`User ${user.id} attempted to update report ${id} without permission`, req);
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به بروزرسانی گزارش‌ها را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const { status, adminNotes } = req.body;

        if (!status || !['pending', 'resolved', 'rejected'].includes(status)) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'وضعیت نامعتبر است',
              code: 'BAD_REQUEST'
            }
          });
        }

        const report = await prisma.report.update({
          where: { id: id as string },
          data: {
            status,
            adminNotes,
          },
          include: {
            reporter: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        });

        logger.info(`Successfully updated report ${id}`, req);
        return res.status(200).json({ success: true, data: report });
      } catch (error) {
        logger.error('Error updating report', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در بروزرسانی گزارش',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST', 'PUT']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 