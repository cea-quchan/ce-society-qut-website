import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const publishSchema = z.object({
  published: z.boolean(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (typeof id !== 'string') {
    return res.status(400).json({ 
      success: false, 
      error: { 
        message: 'شناسه نامعتبر است', 
        code: 'INVALID_REQUEST' 
      } 
    });
  }

  switch (req.method) {
    case 'POST':
      try {
        logger.info(`Updating publish status for news item: ${id}`, req);
        
        const validation = publishSchema.safeParse(req.body);
        if (!validation.success) {
          return res.status(400).json({
            success: false,
            error: {
              message: 'داده‌های ارسالی نامعتبر است',
              code: 'VALIDATION_ERROR',
              details: validation.error.errors.map(e => e.message)
            }
          });
        }

        const { published } = validation.data;
        
        const updateData: any = {
          published,
        };
        
        if (published) {
          updateData.publishedAt = new Date();
        } else {
          updateData.publishedAt = null;
        }

        const updatedNews = await prisma.news.update({
          where: { id },
          data: updateData,
        });

        logger.info(`Successfully updated publish status for news item: ${id}`, req);
        return res.status(200).json({ 
          success: true, 
          data: updatedNews,
          message: `خبر ${published ? 'منتشر شد' : 'پیش‌نویس شد'}`
        });
      } catch (error: any) {
        if (error.code === 'P2025') {
          return res.status(404).json({ 
            success: false, 
            error: { 
              message: 'خبر پیدا نشد', 
              code: 'NOT_FOUND' 
            } 
          });
        }
        
        logger.error('Error updating news publish status', error, req);
        return res.status(500).json({ 
          success: false, 
          error: { 
            message: 'خطا در تغییر وضعیت خبر', 
            code: 'INTERNAL_SERVER_ERROR' 
          } 
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['POST']);
      return res.status(405).json({
        success: false,
        error: {
          message: `Method ${req.method} Not Allowed`,
          code: 'METHOD_NOT_ALLOWED'
        }
      });
  }
} 