import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse } from '@/types/api';
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { User } from '@prisma/client';
import { withErrorHandling } from '@/middleware/base';
import { withAuth } from '@/middleware/auth';
import { z } from 'zod';
import { EventParticipant } from '@prisma/client';

const participantSchema = z.object({
  status: z.enum(['registered', 'attended', 'cancelled']).default('registered'),
  notes: z.string().max(500, 'یادداشت نمی‌تواند بیشتر از 500 کاراکتر باشد').optional()
});

type EventParticipantWithUser = EventParticipant & {
  user: Pick<User, 'id' | 'name' | 'image' | 'role'>;
};

type ParticipantResponse = {
  id: string;
  user: User;
  status: string;
  registeredAt: Date;
};

type ParticipantsListResponse = {
  items: ParticipantResponse[];
  pagination: {
    total: number;
    currentPage: number;
    limit: number;
    totalPages: number;
  };
};

export default withErrorHandling(
  withAuth(async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<ParticipantsListResponse>>) {
    const { id: eventId } = req.query;

    if (!eventId || typeof eventId !== 'string') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'شناسه رویداد الزامی است',
          code: 'BAD_REQUEST'
        }
      });
    }

    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'لطفاً وارد حساب کاربری خود شوید',
          code: 'UNAUTHORIZED'
        }
      });
    }

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { participants: true }
        }
      }
    });

    if (!event) {
      logger.warn(`Event ${eventId} not found`, req);
      return res.status(404).json({
        success: false,
        error: {
          message: 'رویداد یافت نشد',
          code: 'NOT_FOUND'
        }
      });
    }

    if (req.method === 'GET') {
      try {
        logger.info(`Fetching participants for event ${eventId}`, req);
        const { status } = req.query;

        const where: any = { eventId };
        if (status) where.status = status;

        const participants = await prisma.eventParticipant.findMany({
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
        }) as EventParticipantWithUser[];

        const participantsData: ParticipantResponse[] = participants.map(p => ({
          id: p.id,
          user: p.user as User,
          status: p.status,
          registeredAt: p.createdAt
        }));

        const responseData: ParticipantsListResponse = {
          items: participantsData,
          pagination: {
            total: participants.length,
            currentPage: 1,
            limit: participants.length,
            totalPages: 1
          }
        };

        logger.info(`Successfully fetched ${participants.length} participants`, req);
        return res.status(200).json({
          success: true,
          data: responseData
        });
      } catch (error) {
        logger.error('Error fetching participants', error, req);
        return res.status(500).json({
          success: false,
          error: {
            message: 'خطا در دریافت شرکت‌کنندگان',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
    }

    if (req.method === 'POST') {
      try {
        logger.info(`Registering user for event ${eventId}`, req);
        const participantData = req.body;

        // Validate request body
        const validationResult = participantSchema.safeParse(participantData);
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

        // Check if event is full
        if (event._count.participants >= event.capacity) {
          logger.warn(`Event ${eventId} is full`, req);
          return res.status(400).json({
            success: false,
            error: {
              message: 'ظرفیت رویداد تکمیل شده است',
              code: 'EVENT_FULL'
            }
          });
        }

        // Check if user is already registered
        const existingParticipant = await prisma.eventParticipant.findFirst({
          where: {
            eventId,
            userId: req.user.id
          }
        });

        if (existingParticipant) {
          logger.warn(`User ${req.user.id} already registered for event ${eventId}`, req);
          return res.status(400).json({
            success: false,
            error: {
              message: 'شما قبلاً در این رویداد ثبت‌نام کرده‌اید',
              code: 'ALREADY_REGISTERED'
            }
          });
        }

        const participant = await prisma.eventParticipant.create({
          data: {
            ...participantData,
            eventId,
            userId: req.user.id
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
        }) as EventParticipantWithUser;

        const participantResponse: ParticipantResponse = {
          id: participant.id,
          user: participant.user as User,
          status: participant.status,
          registeredAt: participant.createdAt
        };

        logger.info(`Successfully registered user ${req.user.id} for event ${eventId}`, req);
        return res.status(201).json({
          success: true,
          data: participantResponse
        });
      } catch (error) {
        logger.error('Error registering participant', error, req);
        return res.status(500).json({
          success: false,
          error: {
            message: 'خطا در ثبت‌نام در رویداد',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
    }

    if (req.method === 'DELETE') {
      try {
        logger.info(`Cancelling registration for event ${eventId}`, req);

        const participant = await prisma.eventParticipant.findFirst({
          where: {
            eventId,
            userId: req.user.id
          }
        });

        if (!participant) {
          logger.warn(`User ${req.user.id} not registered for event ${eventId}`, req);
          return res.status(404).json({
            success: false,
            error: {
              message: 'شما در این رویداد ثبت‌نام نکرده‌اید',
              code: 'NOT_FOUND'
            }
          });
        }

        await prisma.eventParticipant.delete({
          where: { id: participant.id }
        });

        logger.info(`Successfully cancelled registration for event ${eventId}`, req);
        return res.status(200).json({
          success: true,
          data: { message: 'ثبت‌نام با موفقیت لغو شد' }
        });
      } catch (error) {
        logger.error('Error cancelling registration', error, req);
        return res.status(500).json({
          success: false,
          error: {
            message: 'خطا در لغو ثبت‌نام',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).json({
      success: false,
      error: {
        message: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  })
); 