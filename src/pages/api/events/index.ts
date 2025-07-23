import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { AppError } from '@/middleware/error';
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';

const eventSchema = z.object({
  title: z.string()
    .min(1, 'عنوان نمی‌تواند خالی باشد')
    .max(100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  description: z.string()
    .min(1, 'توضیحات نمی‌تواند خالی باشد')
    .max(1000, 'توضیحات نمی‌تواند بیشتر از 1000 کاراکتر باشد'),
  startDate: z.string().datetime('تاریخ شروع نامعتبر است'),
  endDate: z.string().datetime('تاریخ پایان نامعتبر است'),
  location: z.string().min(1, 'مکان نمی‌تواند خالی باشد'),
  capacity: z.number().min(1, 'ظرفیت باید حداقل 1 نفر باشد'),
  category: z.string().min(1, 'دسته‌بندی الزامی است'),
  status: z.enum(['draft', 'published', 'cancelled']).default('draft')
});

type EventData = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  organizerId: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  organizer: {
    id: string;
    name: string;
    email: string;
  };
  participants: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    eventId: string;
    status: string;
  }[];
};

type EventsResponse = {
  events: EventData[];
  total: number;
  page: number;
  limit: number;
};

type DeleteResponse = {
  message: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'لطفا وارد حساب کاربری خود شوید',
        code: 'UNAUTHORIZED'
      }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
          prisma.event.findMany({
            skip,
            take: limit,
            include: {
              organizer: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              },
              participants: true
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.event.count()
        ]);

        const eventsData: EventData[] = events.map(event => ({
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          capacity: event.capacity,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          organizerId: event.organizerId,
          organizer: event.organizer,
          participants: event.participants
        }));

        return res.status(200).json({
          success: true,
          data: {
            events: eventsData,
            total,
            page,
            limit
          }
        });
      }

      case 'POST': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به این بخش را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const { title, description, startDate, endDate, location, capacity } = req.body;

        if (!title || !description || !startDate || !endDate) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'عنوان، توضیحات، تاریخ شروع و پایان الزامی است',
              code: 'INVALID_INPUT'
            }
          });
        }

        const event = await prisma.event.create({
          data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location,
            capacity,
            organizerId: session.user.id
          },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            participants: true
          }
        });

        const eventData: EventData = {
          id: event.id,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          capacity: event.capacity,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
          organizerId: event.organizerId,
          organizer: event.organizer,
          participants: event.participants
        };

        return res.status(201).json({
          success: true,
          data: eventData
        });
      }

      case 'DELETE': {
        try {
          const { id } = req.query;
          logger.info(`Deleting event ${id}`, req);

          if (!id) {
            return res.status(400).json({
              success: false,
              error: {
                message: 'شناسه رویداد الزامی است',
                code: 'INVALID_INPUT'
              }
            });
          }

          const event = await prisma.event.findFirst({
            where: {
              id: id as string,
              organizerId: session.user.id
            }
          });

          if (!event) {
            logger.warn(`Event ${id} not found or unauthorized`, req);
            return res.status(404).json({
              success: false,
              error: {
                message: 'رویداد یافت نشد',
                code: 'NOT_FOUND'
              }
            });
          }

          // Delete related data first
          await prisma.$transaction([
            prisma.like.deleteMany({ where: { eventId: id as string } }),
            prisma.comment.deleteMany({ where: { eventId: id as string } }),
            prisma.event.delete({ where: { id: id as string } })
          ]);

          logger.info(`Successfully deleted event ${id}`, req);
          return res.status(200).json({
            success: true,
            data: { message: 'رویداد با موفقیت حذف شد' }
          });
        } catch (error) {
          logger.error('Error deleting event', error, req);
          return res.status(500).json({
            success: false,
            error: {
              message: 'خطا در حذف رویداد',
              code: 'INTERNAL_SERVER_ERROR'
            }
          });
        }
      }

      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        }
        return res.status(405).json({
          success: false,
          error: {
            message: `Method ${req.method} Not Allowed`,
            code: 'METHOD_NOT_ALLOWED'
          }
        });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      });
    }
    console.error('Error handling events:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'خطای سرور',
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