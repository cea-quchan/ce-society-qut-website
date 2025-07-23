import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type RegisterResponse = {
  message: string;
  competition: {
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
  };
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    if (res.setHeader) {
      res.setHeader('Allow', ['POST']);
    }
    return res.status(405).json({
      success: false,
      error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
    });
  }

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  try {
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

    await prisma.competitionParticipant.create({
      data: {
        competitionId,
        userId: session.user.id
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        message: 'ثبت نام شما با موفقیت انجام شد',
        competition: {
          id: competition.id,
          title: competition.title,
          description: competition.description,
          startDate: competition.startDate,
          endDate: competition.endDate,
          location: competition.location,
          organizerId: competition.organizerId,
          status: competition.status,
          rules: competition.rules,
          prize: competition.prize,
          maxParticipants: competition.maxParticipants
        }
      } as RegisterResponse
    });
  } catch (error) {
    console.error('Error registering for competition:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 