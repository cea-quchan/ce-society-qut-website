import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { AppError } from '@/middleware/error';
import type { ApiResponse } from '@/types/api';
import { z } from 'zod';

// Add zod schema for library resource creation
const libraryResourceSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  content: z.string().min(5, 'محتوا باید حداقل ۵ کاراکتر باشد'),
  categoryId: z.string().min(1, 'دسته‌بندی الزامی است'),
  tags: z.array(z.string().min(1, 'تگ نامعتبر است')).optional().default([]),
  url: z.string().url('آدرس فایل نامعتبر است'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ success: false, error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' } });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { page = '1', limit = '10', category, search } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where = {
          ...(category && { category: { id: String(category) } }),
          ...(search && {
            OR: [
              { title: { contains: String(search), mode: 'insensitive' as const } },
              { description: { contains: String(search), mode: 'insensitive' as const } }
            ]
          })
        };

        const [resources, total] = await Promise.all([
          prisma.libraryResource.findMany({
            where,
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  image: true
                }
              },
              category: true
            },
            orderBy: {
              createdAt: 'desc'
            },
            skip,
            take: Number(limit)
          }),
          prisma.libraryResource.count({ where })
        ]);

        return res.status(200).json({ success: true, data: { resources, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } } });
      }

      case 'POST': {
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ success: false, error: { message: 'شما دسترسی به ایجاد منبع جدید را ندارید', code: 'FORBIDDEN' } });
        }

        // اعتبارسنجی ورودی با zod
        const validation = libraryResourceSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({ success: false, error: { message: 'داده‌های نامعتبر', code: 'VALIDATION_ERROR', details: validation.error.errors } });
        }
        const { title, description, content, categoryId, tags, url } = validation.data;

        const resource = await prisma.libraryResource.create({
          data: {
            title,
            description,
            content,
            url,
            authorId: session.user.id,
            categoryId: String(categoryId),
            tags: Array.isArray(tags) ? tags.join(',') : '',
            type: 'ARTICLE',
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            category: true
          }
        });

        return res.status(201).json({ success: true, data: resource });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ success: false, error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' } });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({ success: false, error: { message: error.message, code: error.code } });
    }
    return res.status(500).json({ success: false, error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' } });
  }
} 