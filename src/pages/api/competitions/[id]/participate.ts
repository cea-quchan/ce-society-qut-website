import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";

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
      case 'POST': {
        const competition = await prisma.competition.findUnique({
          where: { id: id as string },
          include: {
            participants: true
          }
        });

        if (!competition) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        if (new Date() > competition.endDate) {
          return res.status(400).json({
            success: false,
            error: { message: 'مهلت ثبت‌نام در مسابقه به پایان رسیده است', code: 'INVALID_REQUEST' }
          });
        }

        if (competition.participants.some(p => p.id === session.user.id)) {
          return res.status(400).json({
            success: false,
            error: { message: 'شما قبلاً در این مسابقه ثبت‌نام کرده‌اید', code: 'ALREADY_PARTICIPATED' }
          });
        }

        const updatedCompetition = await prisma.competition.update({
          where: { id: id as string },
          data: {
            participants: {
              connect: {
                id: session.user.id
              }
            }
          },
          include: {
            participants: true
          }
        });

        return res.status(200).json({ success: true, data: updatedCompetition });
      }
      case 'DELETE': {
        const competitionToLeave = await prisma.competition.findUnique({
          where: { id: id as string },
          include: {
            participants: true
          }
        });

        if (!competitionToLeave) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        if (!competitionToLeave.participants.some(p => p.id === session.user.id)) {
          return res.status(400).json({
            success: false,
            error: { message: 'شما در این مسابقه ثبت‌نام نکرده‌اید', code: 'NOT_FOUND' }
          });
        }

        const updatedCompetitionAfterLeave = await prisma.competition.update({
          where: { id: id as string },
          data: {
            participants: {
              disconnect: {
                id: session.user.id
              }
            }
          },
          include: {
            participants: true
          }
        });

        return res.status(200).json({ success: true, data: updatedCompetitionAfterLeave });
      }
      default:
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' } });
  }
} 