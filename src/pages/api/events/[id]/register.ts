import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { ApiResponse } from '@/types/api';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

type RegisterResponse = {
  message: string;
  eventId: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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

  const { id } = req.query;
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
    logger.info(`Fetching event with ID: ${id}`, req);
    const event = await prisma.event.findUnique({
      where: { id: id as string },
      include: {
        participants: true
      }
    });

    if (!event) {
      logger.warn(`Event not found with ID: ${id}`, req);
      return res.status(404).json({
        success: false,
        error: {
          message: 'رویداد یافت نشد',
          code: 'NOT_FOUND'
        }
      });
    }

    // Check if event is at full capacity
    if (event.participants.length >= event.capacity) {
      logger.warn(`Event ${id} is at full capacity`, req);
      return res.status(400).json({
        success: false,
        error: {
          message: 'ظرفیت رویداد تکمیل شده است',
          code: 'CAPACITY_FULL'
        }
      });
    }

    // Check if user is already registered
    const existingParticipant = await prisma.eventParticipant.findFirst({
      where: {
        eventId: id as string,
        userId: session.user.id
      }
    });

    if (existingParticipant) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'شما قبلاً در این رویداد ثبت‌نام کرده‌اید',
          code: 'ALREADY_REGISTERED'
        }
      });
    }

    logger.info(`Registering for event ${id}`, req);
    
    // Create event participant record
    const participant = await prisma.eventParticipant.create({
      data: {
        eventId: id as string,
        userId: session.user.id,
        status: 'pending'
      }
    });

    logger.info(`Successfully registered for event ${id}`, req);

    return res.status(200).json({
      success: true,
      data: {
        message: 'ثبت‌نام با موفقیت انجام شد',
        eventId: id as string
      }
    });
  } catch (error) {
    logger.error(`Error registering for event ${id}`, error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'خطا در ثبت‌نام رویداد',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 