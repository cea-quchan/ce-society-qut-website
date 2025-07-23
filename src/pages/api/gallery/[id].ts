import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import type { ApiResponse, ErrorCode } from '@/types/api';
import { promises as fs } from 'fs';
import path from 'path';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) => {
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED' as ErrorCode
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    logger.warn('Unauthorized access attempt', req);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED' as ErrorCode
      }
    });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const image = await prisma.galleryItem.findUnique({
        where: { id: String(id) },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      if (!image) {
        logger.warn(`Image not found: ${id}`, req);
        return res.status(404).json({
          success: false,
          error: {
            message: 'Image not found',
            code: 'NOT_FOUND' as ErrorCode
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: image
      });
    }

    if (req.method === 'PUT') {
      const { title, description, imageUrl, caption, thumbnailUrl } = req.body;

      if (!title || !description) {
        logger.warn('Missing required fields', req);
        return res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'BAD_REQUEST' as ErrorCode
          }
        });
      }

      // پیدا کردن آیتم قبلی برای تاریخچه و حذف عکس قبلی در صورت نیاز
      const prevItem = await prisma.galleryItem.findUnique({ where: { id: String(id) } });
      let newImageUrl = prevItem?.imageUrl;
      let newThumbnailUrl = (prevItem as import('@/types/api').GalleryItem)?.thumbnailUrl;
      // اگر imageUrl جدید ارسال شده
      if (imageUrl && imageUrl !== prevItem?.imageUrl) {
        // اگر عکس قبلی فایل بود، حذف کن
        if (prevItem?.imageUrl && prevItem.imageUrl.startsWith('/uploads/')) {
          const filePath = path.join(process.cwd(), 'public', prevItem.imageUrl);
          try { await fs.unlink(filePath); } catch {}
        }
        // اگر imageUrl جدید base64 بود، ذخیره کن
        if (typeof imageUrl === 'string' && imageUrl.startsWith('data:image/')) {
          const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(imageUrl);
          if (!matches) {
            return res.status(400).json({ success: false, error: { message: 'فرمت فایل فقط باید JPG یا PNG باشد', code: 'INVALID_FILE_TYPE' } });
          }
          const ext = matches[1] === 'image/png' ? 'png' : 'jpg';
          const base64Data = imageUrl.split(',')[1];
          const fileSize = Buffer.byteLength(base64Data, 'base64');
          if (fileSize > 2 * 1024 * 1024) {
            return res.status(400).json({ success: false, error: { message: 'حجم فایل نباید بیشتر از ۲ مگابایت باشد', code: 'FILE_TOO_LARGE' } });
          }
          const filename = `${Date.now()}-${id}.${ext}`;
          const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
          await fs.writeFile(filePath, Buffer.from(base64Data, 'base64'));
          newImageUrl = `/uploads/${filename}`;
          // TODO: تولید thumbnail و ذخیره آن (در گام بعد)
        } else {
          // اگر لینک اینترنتی است
          newImageUrl = imageUrl;
        }
      }
      // اگر thumbnailUrl جدید ارسال شده
      if (thumbnailUrl) {
        newThumbnailUrl = thumbnailUrl;
      }
      // ویرایش آیتم
      const image = await prisma.galleryItem.update({
        where: { id: String(id) },
        data: { title, description, imageUrl: newImageUrl, caption, thumbnailUrl: newThumbnailUrl }
      });
      // ثبت تاریخچه تغییرات
      await prisma.galleryItemHistory.create({
        data: {
          galleryItemId: image.id,
          title: prevItem?.title || '',
          description: prevItem?.description,
          category: prevItem?.category || '',
          imageUrl: prevItem?.imageUrl || '',
          order: prevItem?.order || 0,
          changedBy: session.user.id,
          changeType: 'edit'
        }
      });
      return res.status(200).json({
        success: true,
        data: image
      });
    }

    if (req.method === 'DELETE') {
      // ابتدا رکورد را پیدا کن تا imageUrl را داشته باشیم
      const image = await prisma.galleryItem.findUnique({ where: { id: String(id) } });
      if (image && image.imageUrl && image.imageUrl.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), 'public', image.imageUrl);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          // اگر فایل وجود نداشت، مشکلی نیست
        }
      }
      await prisma.galleryItem.delete({
        where: { id: String(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Image deleted successfully'
      });
    }
  } catch (error) {
    logger.error('Error processing gallery image', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error processing gallery image',
        code: 'INTERNAL_SERVER_ERROR' as ErrorCode
      }
    });
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler as any),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 