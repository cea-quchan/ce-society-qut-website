import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type CompetitionData = {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string | null;
  organizerId: string;
  status: string;
  rules: string | null;
  prize: string | null;
  maxParticipants: number | null;
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

type DeleteResponse = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const competition = await prisma.competition.findUnique({
          where: { id: id as string },
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

        if (!competition) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        return res.status(200).json({
          success: true,
          data: competition
        });

      case 'PUT':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
          });
        }

        const { title, description, startDate, endDate, location, rules, prize, maxParticipants } = req.body;
        const updatedCompetition = await prisma.competition.update({
          where: { id: id as string },
          data: {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            location,
            rules,
            prize,
            maxParticipants
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

        return res.status(200).json({
          success: true,
          data: updatedCompetition
        });

      case 'DELETE':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
          });
        }

        await prisma.competition.delete({
          where: { id: id as string }
        });

        return res.status(200).json({
          success: true,
          data: { message: 'مسابقه با موفقیت حذف شد' } as DeleteResponse
        });

      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        }
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling competition:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 