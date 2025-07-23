import type { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type EventData = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
  organizerId: string;
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

type DeleteResponse = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'لطفا وارد حساب کاربری خود شوید',
        code: 'UNAUTHORIZED',
      },
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const event = await prisma.event.findUnique({
          where: { id: id as string },
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            participants: true,
          },
        });

        if (!event) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'رویداد یافت نشد',
              code: 'NOT_FOUND',
            },
          });
        }
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
          participants: event.participants,
        };
        return res.status(200).json({
          success: true,
          data: eventData,
        });
      }
      case 'PUT': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به این بخش را ندارید',
              code: 'FORBIDDEN',
            },
          });
        }
        const { title, description, startDate, endDate, location, capacity } = req.body;
        if (!title || !description || !startDate || !endDate || !location || !capacity) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'همه فیلدها الزامی است',
              code: 'INVALID_INPUT',
            },
          });
        }
        try {
          const updatedEvent = await prisma.event.update({
            where: { id: id as string },
            data: {
              title,
              description,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              location,
              capacity,
            },
            include: {
              organizer: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
              participants: true,
            },
          });
          const updatedEventData: EventData = {
            id: updatedEvent.id,
            title: updatedEvent.title,
            description: updatedEvent.description,
            startDate: updatedEvent.startDate,
            endDate: updatedEvent.endDate,
            location: updatedEvent.location,
            capacity: updatedEvent.capacity,
            createdAt: updatedEvent.createdAt,
            updatedAt: updatedEvent.updatedAt,
            organizerId: updatedEvent.organizerId,
            organizer: updatedEvent.organizer,
            participants: updatedEvent.participants,
          };
          return res.status(200).json({
            success: true,
            data: updatedEventData,
          });
        } catch (e) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'رویداد یافت نشد یا خطا در ویرایش',
              code: 'NOT_FOUND',
            },
          });
        }
      }
      case 'DELETE': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به این بخش را ندارید',
              code: 'FORBIDDEN',
            },
          });
        }
        try {
          await prisma.event.delete({
            where: { id: id as string },
          });
          return res.status(200).json({
            success: true,
            data: { message: 'رویداد با موفقیت حذف شد' },
          });
        } catch (e) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'رویداد یافت نشد یا خطا در حذف',
              code: 'NOT_FOUND',
            },
          });
        }
      }
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: {
            message: `Method ${req.method} Not Allowed`,
            code: 'METHOD_NOT_ALLOWED',
          },
        });
    }
  } catch (error) {
    console.error('Error handling event:', error);
    return res.status(500).json({
      success: false,
      error: {
        message: 'خطای سرور',
        code: 'INTERNAL_SERVER_ERROR',
      },
    });
  }
} 