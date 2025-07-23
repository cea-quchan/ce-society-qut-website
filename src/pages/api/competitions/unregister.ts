import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

type UnregisterResponse = {
  message: string;
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

    const participant = await prisma.competitionParticipant.findFirst({
      where: {
        competitionId,
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
      data: { message: 'ثبت نام شما با موفقیت لغو شد' } as UnregisterResponse
    });
  } catch (error) {
    console.error('Error unregistering from competition:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 