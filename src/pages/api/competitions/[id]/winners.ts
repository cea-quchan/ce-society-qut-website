import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";

type Winner = {
  id: string;
  rank: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type Participant = {
  id: string;
  userId: string;
};

type Competition = {
  id: string;
  endDate: Date;
  participants: Participant[];
  winners: Winner[];
};

type WinnerRequestBody = {
  winnerIds: string[];
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
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const competition = await prisma.competition.findUnique({
          where: { id: id as string },
          include: {
            winners: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        });

        if (!competition) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        const winners: Winner[] = competition.winners.map(winner => ({
          id: winner.id,
          rank: winner.rank,
          user: winner.user
        }));

        return res.status(200).json({
          success: true,
          data: winners
        });
      }

      case 'POST': {
        const { winnerIds } = req.body as WinnerRequestBody;

        if (!Array.isArray(winnerIds)) {
          return res.status(400).json({
            success: false,
            error: { message: 'لیست برندگان باید به صورت آرایه باشد', code: 'VALIDATION_ERROR' }
          });
        }

        const competitionToUpdate = await prisma.competition.findUnique({
          where: { id: id as string },
          include: {
            participants: true
          }
        }) as Competition | null;

        if (!competitionToUpdate) {
          return res.status(404).json({
            success: false,
            error: { message: 'مسابقه یافت نشد', code: 'NOT_FOUND' }
          });
        }

        if (new Date() < competitionToUpdate.endDate) {
          return res.status(400).json({
            success: false,
            error: { message: 'مسابقه هنوز به پایان نرسیده است', code: 'VALIDATION_ERROR' }
          });
        }

        const validWinnerIds = winnerIds.filter(id => 
          competitionToUpdate.participants.some(p => p.userId === id)
        );

        if (validWinnerIds.length !== winnerIds.length) {
          return res.status(400).json({
            success: false,
            error: { message: 'برخی از برندگان در مسابقه شرکت نکرده‌اند', code: 'VALIDATION_ERROR' }
          });
        }

        const updatedCompetition = await prisma.competition.update({
          where: { id: id as string },
          data: {
            winners: {
              create: validWinnerIds.map((id, index) => ({
                userId: id,
                rank: index + 1
              }))
            }
          },
          include: {
            winners: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        });

        const updatedWinners: Winner[] = updatedCompetition.winners.map(winner => ({
          id: winner.id,
          rank: winner.rank,
          user: winner.user
        }));

        return res.status(200).json({
          success: true,
          data: updatedWinners
        });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 