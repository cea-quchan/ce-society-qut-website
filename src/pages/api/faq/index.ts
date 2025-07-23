import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import type { ApiResponse, ErrorCode } from '@/types/api';
import { z } from 'zod';

type FaqResponse = {
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    category: string;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
};

// Add zod schema for FAQ creation
const faqSchema = z.object({
  question: z.string().min(5, 'سؤال باید حداقل ۵ کاراکتر باشد'),
  answer: z.string().min(5, 'پاسخ باید حداقل ۵ کاراکتر باشد'),
  category: z.string().min(2, 'دسته‌بندی الزامی است'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<FaqResponse>>
) {
  const session = await getServerSession(req, res, authOptions);

  try {
    switch (req.method) {
      case 'GET':
        const { page = '1', limit = '10', search, category: categoryQuery } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
          AND: [
            search ? {
              OR: [
                { question: { contains: search as string } },
                { answer: { contains: search as string } }
              ]
            } : {},
            typeof categoryQuery === 'string' ? { category: categoryQuery } : {}
          ]
        };

        const [faqs, total] = await Promise.all([
          prisma.fAQ.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: { id: 'desc' }
          }),
          prisma.fAQ.count({ where })
        ]);

        const response: ApiResponse<FaqResponse> = {
          success: true,
          data: {
            faqs,
            pagination: {
              total,
              page: Number(page),
              limit: Number(limit),
              pages: Math.ceil(total / Number(limit))
            }
          }
        };
        return res.status(200).json({ success: true, data: response.data });

      case 'POST':
        if (!session) {
          const response: ApiResponse<FaqResponse> = {
            success: false,
            error: {
              message: 'لطفا وارد حساب کاربری خود شوید',
              code: 'UNAUTHORIZED'
            }
          };
          return res.status(401).json({ success: false, error: { message: response.error?.message || 'Unauthorized', code: response.error?.code || 'UNAUTHORIZED' } });
        }

        if (session.user.role !== 'ADMIN') {
          const response: ApiResponse<FaqResponse> = {
            success: false,
            error: {
              message: 'شما دسترسی به این بخش را ندارید',
              code: 'FORBIDDEN'
            }
          };
          return res.status(403).json({ success: false, error: { message: response.error?.message || 'Forbidden', code: response.error?.code || 'FORBIDDEN' } });
        }

        // اعتبارسنجی ورودی با zod
        const validation = faqSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ success: false, error: { message: 'داده‌های نامعتبر', code: 'VALIDATION_ERROR', details: validation.error.errors } });
        }
        const { question, answer, category } = validation.data;
        const faq = await prisma.fAQ.create({
          data: {
            question,
            answer,
            category
          }
        });

        const successResponse: ApiResponse<FaqResponse> = {
          success: true,
          data: {
            faqs: [faq],
            pagination: { total: 1, page: 1, limit: 1, pages: 1 }
          }
        };
        return res.status(201).json({ success: true, data: successResponse.data });

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        const errorResponse: ApiResponse<FaqResponse> = {
          success: false,
          error: {
            message: `Method ${req.method} Not Allowed`,
            code: 'METHOD_NOT_ALLOWED'
          }
        };
        return res.status(405).json({ success: false, error: { message: errorResponse.error?.message || 'Method Not Allowed', code: errorResponse.error?.code || 'METHOD_NOT_ALLOWED' } });
    }
  } catch (error) {
    if (error instanceof AppError) {
      const errorResponse: ApiResponse<FaqResponse> = {
        success: false,
        error: {
          message: error.message,
          code: error.code
        }
      };
      return res.status(error.statusCode).json({ success: false, error: errorResponse.error });
    }
    const serverErrorResponse: ApiResponse<FaqResponse> = {
      success: false,
      error: {
        message: 'خطای سرور',
        code: 'INTERNAL_SERVER_ERROR'
      }
    };
    return res.status(500).json({ success: false, error: serverErrorResponse.error });
  }
} 