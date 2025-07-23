import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { PaginatedResponse } from '@/types/api';

const newsSchema = z.object({
  title: z.string().min(3, 'عنوان خبر باید حداقل ۳ کاراکتر باشد'),
  content: z.string().min(10, 'متن خبر باید حداقل ۱۰ کاراکتر باشد'),
  summary: z.string().optional(),
  date: z.string().or(z.date()).refine(val => !isNaN(new Date(val).getTime()), { message: 'تاریخ نامعتبر است' }),
  author: z.string().min(2, 'نام نویسنده الزامی است'),
  category: z.string().min(2, 'دسته‌بندی الزامی است'),
  images: z.array(z.string()).optional(), // آرایه عکس‌ها (base64 یا لینک)
  published: z.boolean().optional().default(false),
  publishedAt: z.string().or(z.date()).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching all news', req);
        const { page = '1', limit = '10', search, category, published } = req.query;
        
        const pageNum = parseInt(page as string) || 1;
        const limitNum = parseInt(limit as string) || 10;
        const skip = (pageNum - 1) * limitNum;
        
        // Build where clause
        const where: Record<string, unknown> = {};
        if (search) {
          where.OR = [
            { title: { contains: search as string, mode: 'insensitive' } },
            { content: { contains: search as string, mode: 'insensitive' } },
            { author: { contains: search as string, mode: 'insensitive' } },
          ];
        }
        if (category) {
          where.category = category;
        }
        if (published !== undefined) {
          where.published = published === 'true';
        }
        
        const [news, total] = await Promise.all([
          prisma.news.findMany({
            where,
            orderBy: { date: 'desc' },
            skip,
            take: limitNum,
            include: { images: true },
          }),
          prisma.news.count({ where })
        ]);
        
        logger.info(`Successfully fetched ${news.length} news items`, req);
        const response: PaginatedResponse<typeof news[0]> = {
          success: true,
          data: {
            items: news,
            pagination: {
              total,
              currentPage: pageNum,
              limit: limitNum,
              totalPages: Math.ceil(total / limitNum)
            }
          }
        };
        return res.status(200).json({
          success: true,
          data: response
        });
      } catch (error) {
        logger.error('Error fetching news', error, req);
        return res.status(500).json({ success: false, error: { message: 'خطا در دریافت اخبار', code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;

    case 'POST':
      // اضافه کردن چک سشن و نقش
      const session = await getServerSession(req, res, authOptions);
      if (!session || session.user.role !== 'ADMIN') {
        return res.status(401).json({ success: false, error: { message: 'دسترسی غیرمجاز', code: 'UNAUTHORIZED' } });
      }
      let createdFiles: string[] = [];
      try {
        logger.info('Creating new news item', req);
        const validation = newsSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ success: false, error: { message: 'داده‌های ارسالی نامعتبر است', code: 'VALIDATION_ERROR', details: validation.error.errors.map(e => e.message) } });
        }
        const data = validation.data;
        let order = 0;
        createdFiles = [];
        const newsData: {
          title: string;
          content: string;
          summary?: string;
          date: Date;
          author: string;
          category: string;
          published: boolean;
          publishedAt?: Date;
        } = {
          title: data.title,
          content: data.content,
          summary: data.summary,
          date: new Date(data.date),
          author: data.author,
          category: data.category,
          published: data.published || false,
        };
        if (data.published && data.publishedAt) {
          newsData.publishedAt = new Date(data.publishedAt);
        } else if (data.published) {
          newsData.publishedAt = new Date();
        }
        // ذخیره عکس‌ها (base64 یا لینک) با اعتبارسنجی حجم و تراکنش
        const images: string[] = data.images || [];
        let newsWithImages: Awaited<ReturnType<typeof prisma.news.findUnique>> | null = null;
        await prisma.$transaction(async (tx) => {
          // ابتدا خبر را ایجاد کن
          const newsItem = await tx.news.create({ data: newsData });
          for (const img of images) {
            let url = img;
            if (typeof img === 'string' && img.startsWith('data:image/')) {
              const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(img);
              if (!matches) continue;
              const ext = matches[1] === 'image/png' ? 'png' : 'jpg';
              const base64Data = img.split(',')[1];
              // اعتبارسنجی حجم (حداکثر ۲ مگابایت)
              const fileSize = Buffer.byteLength(base64Data, 'base64');
              if (fileSize > 2 * 1024 * 1024) {
                throw new Error('حجم هر عکس نباید بیشتر از ۲ مگابایت باشد');
              }
              const filename = `${uuidv4()}.${ext}`;
              const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
              await fs.promises.writeFile(filePath, Buffer.from(base64Data, 'base64'));
              createdFiles.push(filePath);
              url = `/uploads/${filename}`;
            }
            await tx.newsImage.create({
              data: {
                url,
                newsId: newsItem.id,
                order: order++
              }
            });
          }
          // پس از ایجاد خبر و تصاویر، خبر را با تصاویرش واکشی کن
          newsWithImages = await tx.news.findUnique({
            where: { id: newsItem.id },
            include: { images: true }
          });
        });
        logger.info(`Successfully created news item with transaction`, req);
        return res.status(201).json({ success: true, data: newsWithImages });
      } catch (error) {
        // اگر فایل فیزیکی ایجاد شده اما تراکنش شکست خورد، فایل‌ها را حذف کن
        if (typeof createdFiles !== 'undefined' && Array.isArray(createdFiles)) {
          for (const filePath of createdFiles) {
            try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
          }
        }
        logger.error('Error creating news item (transaction)', error, req);
        const msg = error instanceof Error && error.message.includes('۲ مگابایت') ? 'حجم هر عکس نباید بیشتر از ۲ مگابایت باشد' : 'خطا در ایجاد خبر';
        return res.status(500).json({ success: false, error: { message: msg, code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ success: false, error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' } });
  }
} 