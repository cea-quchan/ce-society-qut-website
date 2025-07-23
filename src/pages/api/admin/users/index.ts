import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';
import {
  createApiResponse,
  createUnauthorizedResponse,
  createErrorResponse,
  createValidationErrorResponse
} from '@/lib/apiResponse';

// Validation schemas
const getUsersSchema = z.object({
  page: z.string().optional().transform(val => Number(val) || 1),
  limit: z.string().optional().transform(val => Number(val) || 20),
  search: z.string().optional(),
  role: z.string().optional(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json(createUnauthorizedResponse('لطفا وارد حساب کاربری خود شوید'));
  }

  if (session.user.role !== 'ADMIN') {
    return res.status(403).json(createErrorResponse('شما دسترسی به این بخش را ندارید', 'FORBIDDEN'));
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { page, limit, search, role } = getUsersSchema.parse(req.query);
        const skip = (page - 1) * limit;

        const where: any = {};

        if (search) {
          where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ];
        }

        if (role && role !== 'all') {
          where.role = role;
        }

        const [users, total] = await Promise.all([
          prisma.user.findMany({
            where,
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: limit,
          }),
          prisma.user.count({ where })
        ]);

        const data = {
          users,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
          }
        };

        return res.status(200).json(createApiResponse(data));
      }

      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json(createErrorResponse(
          `Method ${req.method} Not Allowed`,
          'METHOD_NOT_ALLOWED'
        ));
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json(createValidationErrorResponse(
        error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      ));
    }

    if (error instanceof AppError) {
      return res.status(error.statusCode).json(createErrorResponse(
        error.message,
        error.code
      ));
    }

    console.error('Admin Users API Error:', error);
    return res.status(500).json(createErrorResponse(
      'خطای سرور',
      'INTERNAL_SERVER_ERROR'
    ));
  }
} 