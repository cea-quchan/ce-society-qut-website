import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type ParticipantData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  competitionId: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type ParticipantsResponse = {
  participants: ParticipantData[];
  total: number;
  page: number;
  limit: number;
};

type DeleteResponse = {
  message: string;
};

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
        const { competitionId } = req.query;
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        if (!competitionId) {
          return res.status(400).json({
            success: false,
            error: { message: 'شناسه مسابقه الزامی است', code: 'INVALID_INPUT' }
          });
        }

        const [participants, total] = await Promise.all([
          prisma.competitionParticipant.findMany({
            where: { competitionId: competitionId as string },
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' }
          }),
          prisma.competitionParticipant.count({
            where: { competitionId: competitionId as string }
          })
        ]);

        return res.status(200).json({
          success: true,
          data: {
            participants,
            total,
            page,
            limit
          }
        });
      }

      case 'POST': {
        const { competitionId } = req.body;

        if (!competitionId) {
          return res.status(400).json({
            success: false,
            error: { message: 'شناسه مسابقه الزامی است', code: 'INVALID_INPUT' }
          });
        }

        const competition = await prisma.competition.findUnique({
          where: { id: competitionId },
          include: { participants: true }
        });

        if (!competition) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        if (competition.maxParticipants && competition.participants.length >= competition.maxParticipants) {
          return res.status(400).json({
            success: false,
            error: { message: 'ظرفیت مسابقه تکمیل شده است', code: 'MAX_PARTICIPANTS_REACHED' }
          });
        }

        const existingParticipant = await prisma.competitionParticipant.findFirst({
          where: {
            competitionId,
            userId: session.user.id
          }
        });

        if (existingParticipant) {
          return res.status(400).json({
            success: false,
            error: { message: 'شما قبلا در این مسابقه ثبت نام کرده‌اید', code: 'ALREADY_PARTICIPATED' }
          });
        }

        const participant = await prisma.competitionParticipant.create({
          data: {
            competitionId,
            userId: session.user.id
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        return res.status(201).json({
          success: true,
          data: participant as ParticipantData
        });
      }

      case 'DELETE': {
        const { competitionId } = req.query;

        if (!competitionId) {
          return res.status(400).json({
            success: false,
            error: { message: 'شناسه مسابقه الزامی است', code: 'INVALID_INPUT' }
          });
        }

        const participant = await prisma.competitionParticipant.findFirst({
          where: {
            competitionId: competitionId as string,
            userId: session.user.id
          }
        });

        if (!participant) {
          return res.status(404).json({
            success: false,
            error: { message: 'شما در این مسابقه ثبت نام نکرده‌اید', code: 'NOT_FOUND' }
          });
        }

        await prisma.competitionParticipant.delete({
          where: { id: participant.id }
        });

        return res.status(200).json({
          success: true,
          data: { message: 'ثبت نام شما با موفقیت لغو شد' } as DeleteResponse
        });
      }

      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        }
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling competition participants:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 