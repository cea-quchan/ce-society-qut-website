import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import { ApiResponse, PaginatedData } from '@/types/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse>) {
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
        const { page = '1', limit = '10' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [payments, total] = await Promise.all([
          prisma.payment.findMany({
            where: {
              userId: session.user.id
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: Number(limit)
          }),
          prisma.payment.count({
            where: {
              userId: session.user.id
            }
          })
        ]);

        const response: ApiResponse<PaginatedData<any>> = {
          success: true,
          data: {
            items: payments,
            pagination: {
              total,
              currentPage: Number(page),
              limit: Number(limit),
              totalPages: Math.ceil(total / Number(limit))
            }
          }
        };

        return res.status(200).json({
          success: true,
          data: response
        });

      default:
        res.setHeader('Allow', ['GET']);
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