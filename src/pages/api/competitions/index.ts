import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { z } from 'zod';

type CompetitionData = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  rules: string | null;
  prize: string | null;
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
    competitionId: string;
  }[];
};

type CompetitionsResponse = {
  competitions: CompetitionData[];
  total: number;
  page: number;
  limit: number;
};

// Add zod schema for competition creation
const competitionSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  startDate: z.string().datetime('تاریخ شروع نامعتبر است'),
  endDate: z.string().datetime('تاریخ پایان نامعتبر است'),
  location: z.string().min(1, 'مکان الزامی است').optional(),
  rules: z.string().optional(),
  prize: z.string().optional(),
  maxParticipants: z.number().int().positive('حداکثر شرکت‌کنندگان باید عدد مثبت باشد').optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const [competitions, total] = await Promise.all([
          prisma.competition.findMany({
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
          prisma.competition.count()
        ]);

        return res.status(200).json({
          success: true,
          data: {
            competitions,
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
            error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
          });
        }

        // اعتبارسنجی ورودی با zod
        const validation = competitionSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'داده‌های نامعتبر',
              code: 'VALIDATION_ERROR',
              details: validation.error.errors
            }
          });
        }
        const { title, description, startDate, endDate, location, rules, prize, maxParticipants } = validation.data;

        const competition = await prisma.competition.create({
          data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            rules,
            prize,
            maxParticipants: typeof maxParticipants === 'number' ? maxParticipants : 0,
            organizerId: session.user.id,
            status: 'PENDING'
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

        return res.status(201).json({
          success: true,
          data: competition as CompetitionData
        });
      }

      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'POST']);
        }
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling competitions:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 