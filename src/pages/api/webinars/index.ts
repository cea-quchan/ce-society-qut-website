import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

type WebinarType = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  meetingLink: string | null;
  recordingLink: string | null;
  createdAt: Date;
  updatedAt: Date;
  host: {
    id: string;
    name: string;
    image: string | null;
  };
  participants: Array<{ id: string; userId: string }>;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
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
      case 'GET':
        const { page = '1', limit = '10', status, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
          ...(status && { status: String(status) }),
          ...(search && {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' as any } },
              { description: { contains: String(search), mode: 'insensitive' as any } }
            ]
          })
        };

        const [webinars, total] = await Promise.all([
          prisma.webinar.findMany({
            where,
            include: {
              host: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              participants: {
                select: {
                  id: true,
                  userId: true
                }
              }
            },
            orderBy: {
              startDate: 'desc'
            },
            skip,
            take: Number(limit)
          }),
          prisma.webinar.count({ where })
        ]);

        const items: WebinarType[] = webinars.map(w => ({
          ...w,
          meetingLink: w.meetingLink ?? null,
          recordingLink: w.recordingLink ?? null
        }));
        return res.status(200).json({
          success: true,
          data: {
            items,
            pagination: {
              total,
              currentPage: Number(page),
              limit: Number(limit),
              totalPages: Math.ceil(total / Number(limit))
            }
          }
        });

      case 'POST':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ 
            success: false,
            error: {
              message: 'شما دسترسی به ایجاد وبینار جدید را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const { title, description, startDate, endDate, capacity } = req.body;

        if (!title || !description || !startDate || !endDate || !capacity) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'تمام فیلدهای الزامی را پر کنید',
              code: 'BAD_REQUEST'
            }
          });
        }

        const webinar = await prisma.webinar.create({
          data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            maxParticipants: capacity,
            hostId: session.user.id
          },
          include: {
            host: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        });

        return res.status(201).json({
          success: true,
          data: webinar
        });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
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
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
    return res.status(500).json({ 
      success: false,
      error: {
        message: 'خطای سرور',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 