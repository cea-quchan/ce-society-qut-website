import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';

const updatePodcastSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل 3 کاراکتر باشد').max(200, 'عنوان نمی‌تواند بیشتر از 200 کاراکتر باشد').optional(),
  description: z.string().min(10, 'توضیحات باید حداقل 10 کاراکتر باشد').max(2000, 'توضیحات نمی‌تواند بیشتر از 2000 کاراکتر باشد').optional(),
  audioUrl: z.string().url('آدرس فایل صوتی نامعتبر است').optional(),
  duration: z.number().int().positive('مدت زمان باید عدد مثبت باشد').optional(),
  thumbnail: z.string().url('آدرس تصویر نامعتبر است').optional(),
  author: z.string().min(2, 'نام نویسنده باید حداقل 2 کاراکتر باشد').max(100, 'نام نویسنده نمی‌تواند بیشتر از 100 کاراکتر باشد').optional(),
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
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'شناسه پادکست نامعتبر است', code: 'INVALID_ID' }
    });
  }

  if (req.method === 'GET') {
    try {
      const podcast = await prisma.podcast.findUnique({
        where: { id }
      });

      if (!podcast) {
        return res.status(404).json({
          success: false,
          error: { message: 'پادکست یافت نشد', code: 'NOT_FOUND' }
        });
      }

      return res.status(200).json({
        success: true,
        data: podcast
      });
    } catch (error) {
      console.error('Error fetching podcast:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در دریافت پادکست', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else if (req.method === 'PUT') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'دسترسی غیرمجاز', code: 'FORBIDDEN' }
        });
      }

      const validatedData = updatePodcastSchema.parse(req.body);

      const podcast = await prisma.podcast.update({
        where: { id },
        data: validatedData
      });

      return res.status(200).json({
        success: true,
        data: podcast,
        message: 'پادکست با موفقیت ویرایش شد'
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

      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'پادکست یافت نشد', code: 'NOT_FOUND' }
        });
      }

      console.error('Error updating podcast:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در ویرایش پادکست', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else if (req.method === 'DELETE') {
    try {
      const session = await getServerSession(req, res, authOptions);
      
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: { message: 'دسترسی غیرمجاز', code: 'FORBIDDEN' }
        });
      }

      await prisma.podcast.delete({
        where: { id }
      });

      return res.status(200).json({
        success: true,
        message: 'پادکست با موفقیت حذف شد'
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          error: { message: 'پادکست یافت نشد', code: 'NOT_FOUND' }
        });
      }

      console.error('Error deleting podcast:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در حذف پادکست', code: 'INTERNAL_SERVER_ERROR' }
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