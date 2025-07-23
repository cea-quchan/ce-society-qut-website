import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ success: false, error: { message: 'شناسه نامعتبر است', code: 'INVALID_REQUEST' } });
  }

  switch (req.method) {
    case 'GET':
      try {
        const newsItem = await prisma.news.findUnique({ where: { id }, include: { images: true } });
        if (!newsItem) {
          return res.status(404).json({ success: false, error: { message: 'خبر پیدا نشد', code: 'NOT_FOUND' } });
        }
        res.status(200).json({ success: true, data: newsItem });
      } catch (error) {
        logger.error('Error fetching news item', error, req);
        res.status(500).json({ success: false, error: { message: 'خطا در دریافت خبر', code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;
    case 'PUT':
      try {
        const { images, ...newsData } = req.body;
        // images: آرایه‌ای از { id?, url, caption?, thumbnailUrl?, order }
        let newsWithImages;
        await prisma.$transaction(async (tx) => {
          // بروزرسانی خبر
          await tx.news.update({ where: { id }, data: newsData });
          if (Array.isArray(images)) {
            // عکس‌های فعلی دیتابیس
            const oldImages = await tx.newsImage.findMany({ where: { newsId: id } });
            const oldImagesMap = new Map(oldImages.map(img => [img.id, img]));
            const sentIds = images.filter(img => img.id).map(img => img.id);
            // حذف عکس‌هایی که دیگر وجود ندارند
            for (const oldImg of oldImages) {
              if (!sentIds.includes(oldImg.id)) {
                await tx.newsImageHistory.create({
                  data: {
                    newsImageId: oldImg.id,
                    url: oldImg.url,
                    order: oldImg.order,
                    changedBy: newsData.updatedBy || 'system',
                    changeType: 'delete'
                  }
                });
                // حذف فایل فیزیکی اگر لازم بود
                if (oldImg.url && oldImg.url.startsWith('/uploads/')) {
                  const filePath = path.join(process.cwd(), 'public', oldImg.url);
                  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
                }
                await tx.newsImage.delete({ where: { id: oldImg.id } });
              }
            }
            // افزودن یا ویرایش عکس‌ها
            let order = 0;
            for (const img of images) {
              if (img.id && oldImagesMap.has(img.id)) {
                // ویرایش عکس موجود
                const prev = oldImagesMap.get(img.id);
                if (!prev) continue;
                let newUrl = prev.url;
                let newThumbnailUrl = prev.thumbnailUrl;
                // اگر url جدید ارسال شده و متفاوت است
                if (img.url && img.url !== prev.url) {
                  if (prev.url && prev.url.startsWith('/uploads/')) {
                    const filePath = path.join(process.cwd(), 'public', prev.url);
                    try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
                  }
                  if (typeof img.url === 'string' && img.url.startsWith('data:image/')) {
                    const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(img.url);
                    if (!matches) continue;
                    const ext = matches[1] === 'image/png' ? 'png' : 'jpg';
                    const base64Data = img.url.split(',')[1];
                    const fileSize = Buffer.byteLength(base64Data, 'base64');
                    if (fileSize > 2 * 1024 * 1024) continue;
                    const filename = `${Date.now()}-${order}.${ext}`;
                    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                    fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                    newUrl = `/uploads/${filename}`;
                  } else {
                    newUrl = img.url;
                  }
                }
                if (img.thumbnailUrl) newThumbnailUrl = img.thumbnailUrl;
                await tx.newsImage.update({
                  where: { id: img.id },
                  data: {
                    url: newUrl,
                    order: order++
                  }
                });
                await tx.newsImageHistory.create({
                  data: {
                    newsImageId: img.id,
                    url: prev.url,
                    order: prev.order,
                    changedBy: newsData.updatedBy || 'system',
                    changeType: 'edit'
                  }
                });
              } else {
                // افزودن عکس جدید
                let url = img.url;
                const thumbnailUrl = img.thumbnailUrl;
                if (typeof img.url === 'string' && img.url.startsWith('data:image/')) {
                  const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(img.url);
                  if (!matches) continue;
                  const ext = matches[1] === 'image/png' ? 'png' : 'jpg';
                  const base64Data = img.url.split(',')[1];
                  const fileSize = Buffer.byteLength(base64Data, 'base64');
                  if (fileSize > 2 * 1024 * 1024) continue;
                  const filename = `${Date.now()}-${order}.${ext}`;
                  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
                  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
                  url = `/uploads/${filename}`;
                }
                const created = await tx.newsImage.create({
                  data: {
                    url,
                    newsId: id,
                    order: order++
                  }
                });
                await tx.newsImageHistory.create({
                  data: {
                    newsImageId: created.id,
                    url,
                    order: created.order,
                    changedBy: newsData.updatedBy || 'system',
                    changeType: 'create'
                  }
                });
              }
            }
          }
          newsWithImages = await tx.news.findUnique({ where: { id }, include: { images: true } });
        });
        res.status(200).json({ success: true, data: newsWithImages });
      } catch (error) {
        logger.error('Error updating news item (transaction)', error, req);
        res.status(500).json({ success: false, error: { message: 'خطا در ویرایش خبر', code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;
    case 'DELETE':
      try {
        // ابتدا عکس‌های مرتبط را پیدا کن
        const images = await prisma.newsImage.findMany({ where: { newsId: id } });
        // حذف عکس‌های مرتبط از دیتابیس
        await prisma.newsImage.deleteMany({ where: { newsId: id } });
        // حذف فایل‌های فیزیکی عکس‌ها
        for (const img of images) {
          if (img.url && typeof img.url === 'string' && img.url.startsWith('/uploads/')) {
            const filePath = path.join(process.cwd(), 'public', img.url);
            try {
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
              }
            } catch (e) {
              // اگر حذف فایل با خطا مواجه شد، فقط لاگ کن
              logger.warn('Error deleting image file', { filePath, error: e }, req);
            }
          }
        }
        // حذف خود خبر
        await prisma.news.delete({ where: { id } });
        res.status(204).end();
      } catch (error) {
        logger.error('Error deleting news item', error, req);
        res.status(500).json({ success: false, error: { message: 'خطا در حذف خبر', code: 'INTERNAL_SERVER_ERROR' } });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 