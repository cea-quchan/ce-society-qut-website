import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const podcastSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل 3 کاراکتر باشد').max(200, 'عنوان نمی‌تواند بیشتر از 200 کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل 10 کاراکتر باشد').max(2000, 'توضیحات نمی‌تواند بیشتر از 2000 کاراکتر باشد'),
  audioUrl: z.string().url('آدرس فایل صوتی نامعتبر است'),
  duration: z.number().int().positive('مدت زمان باید عدد مثبت باشد'),
  thumbnail: z.string().url('آدرس تصویر نامعتبر است').optional(),
  author: z.string().min(2, 'نام نویسنده باید حداقل 2 کاراکتر باشد').max(100, 'نام نویسنده نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  published: z.boolean().optional()
});

// --- غیرفعال‌سازی موقت ---
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  return res.status(503).json({
    success: false,
    error: { 
      message: 'API پادکست در حال توسعه است', 
      code: 'INTERNAL_SERVER_ERROR' 
    }
  });
}

// --- فعال‌سازی کامل (کافی است این بخش را جایگزین بالا کنی) ---
/*
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', published } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const where = published === 'true' ? { published: true } : {};

      const [podcasts, total] = await Promise.all([
        prisma.podcast.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limitNum,
        }),
        prisma.podcast.count({ where })
      ]);

      return res.status(200).json({
        success: true,
        data: {
          podcasts,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      console.error('Error fetching podcasts:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در دریافت پادکست‌ها', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else if (req.method === 'POST') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'دسترسی غیرمجاز', code: 'FORBIDDEN' }
        });
      }

      const validatedData = podcastSchema.parse(req.body);

      const podcast = await prisma.podcast.create({
        data: validatedData
      });

      return res.status(201).json({
        success: true,
        data: podcast,
        message: 'پادکست با موفقیت اضافه شد'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'داده‌های نامعتبر',
            code: 'VALIDATION_ERROR',
            details: error.errors.map(e => ({
              field: e.path.join('.'),
              message: e.message
            }))
          }
        });
      }

      console.error('Error creating podcast:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در ایجاد پادکست', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
    });
  }
}
*/ 