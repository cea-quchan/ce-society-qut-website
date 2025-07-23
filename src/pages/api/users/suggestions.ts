import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import { z } from 'zod';
import { ApiResponse } from '@/types/api';
import {
  createApiResponse,
  createUnauthorizedResponse,
  createErrorResponse,
  createValidationErrorResponse
} from '@/lib/apiResponse';

// Validation schemas
const getSuggestionsSchema = z.object({
  query: z.string().optional(),
  limit: z.string().optional().transform(val => Number(val) || 10),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
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
        const { query, limit } = getSuggestionsSchema.parse(req.query);

        let suggestions: string[] = [];

        if (query) {
          // Search for names and emails that match the query
          const users = await prisma.user.findMany({
            where: {
              OR: [
                { name: { contains: query } },
                { email: { contains: query } },
              ],
            },
            select: {
              name: true,
              email: true,
            },
            take: limit,
          });

          suggestions = users.flatMap(user => [user.name, user.email]);
        } else {
          // Get popular names and emails for suggestions
          const users = await prisma.user.findMany({
            select: {
              name: true,
              email: true,
            },
            take: limit,
            orderBy: {
              createdAt: 'desc',
            },
          });

          suggestions = users.flatMap(user => [user.name, user.email]);
        }

        // Remove duplicates and limit results
        const uniqueSuggestions = Array.from(new Set(suggestions)).slice(0, limit);

        const data = {
          suggestions: uniqueSuggestions,
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

    console.error('User Suggestions API Error:', error);
    return res.status(500).json(createErrorResponse(
      'خطای سرور',
      'INTERNAL_SERVER_ERROR'
    ));
  }
} 