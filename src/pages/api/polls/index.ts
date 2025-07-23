import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';

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
              { title: { contains: String(search), mode: 'insensitive' as const } },
              { description: { contains: String(search), mode: 'insensitive' as const } }
            ]
          })
        };

        const [polls, total] = await Promise.all([
          prisma.poll.findMany({
            where,
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              options: {
                include: {
                  votes: true
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: Number(limit)
          }),
          prisma.poll.count({ where })
        ]);

        return res.status(200).json({
          success: true,
          data: {
            polls,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        });

      case 'POST':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: {
              message: 'شما دسترسی به ایجاد نظرسنجی جدید را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const { title, description, options, endDate } = req.body;

        if (!title || !description || !Array.isArray(options) || options.length < 2 || !endDate) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'تمام فیلدهای الزامی را پر کنید',
              code: 'BAD_REQUEST'
            }
          });
        }

        const poll = await prisma.poll.create({
          data: {
            title,
            description,
            endDate: new Date(endDate),
            creatorId: session.user.id,
            status: 'ACTIVE',
            options: {
              create: options.map((option: string) => ({
                text: option
              }))
            }
          },
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            options: true
          }
        });

        return res.status(201).json({
          success: true,
          data: poll
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