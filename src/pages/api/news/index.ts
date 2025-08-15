import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { published, limit = '10', page = '1' } = req.query;
      const limitNum = parseInt(limit as string, 10);
      const pageNum = parseInt(page as string, 10);
      const skip = (pageNum - 1) * limitNum;
      const where: Prisma.NewsWhereInput = {};
      if (published !== undefined) {
        where.published = published === 'true';
      }
      const news = await prisma.news.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
        include: {
          images: true,
          author: { select: { id: true, name: true, email: true } },
        },
      });
      return res.status(200).json({
        success: true,
        data: news
      });
    } catch (error) {
      console.error('Error fetching news:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در دریافت اخبار', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { title, content, authorId, published, images } = req.body;
      if (!title || !content || !authorId) {
        return res.status(400).json({ success: false, error: { message: 'اطلاعات ناقص است', code: 'VALIDATION_ERROR' } });
      }
      const news = await prisma.news.create({
        data: {
          title,
          content,
          author: { connect: { id: authorId } },
          published: !!published,
        },
      });
      let order = 0;
      if (Array.isArray(images)) {
        for (const img of images) {
          let url = img.url;
          if (typeof img.url === 'string' && img.url.startsWith('data:image/')) {
            const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(img.url);
            if (!matches) continue;
            const ext = matches[1] === 'image/png' ? 'png' : 'jpg';
            const base64Data = img.url.split(',')[1];
            const fileSize = Buffer.byteLength(base64Data, 'base64');
            if (fileSize > 2 * 1024 * 1024) continue;
            const filename = `${Date.now()}-${Math.floor(Math.random()*10000)}.${ext}`;
            const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
            fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
            url = `/uploads/${filename}`;
          }
          await prisma.newsImage.create({
            data: {
              url,
              alt: img.alt || '',
              newsId: news.id,
              order: order++
            }
          });
        }
      }
      const newsWithImages = await prisma.news.findUnique({ where: { id: news.id }, include: { images: true, author: { select: { id: true, name: true, email: true } } } });
      return res.status(201).json({ success: true, data: newsWithImages });
    } catch (error) {
      console.error('Error creating news:', error);
      return res.status(500).json({ success: false, error: { message: 'خطا در ایجاد خبر', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
} 