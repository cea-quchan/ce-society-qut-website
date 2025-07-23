import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { ApiResponse, MediaResponse } from '@/types/api';
import { withErrorHandling } from '@/middleware/base';
import { withAuth } from '@/middleware/auth';
import { logger } from '@/lib/logger';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { AppError } from '@/middleware/error';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

const mediaSchema = z.object({
  fileName: z.string().min(1, 'نام فایل الزامی است'),
  fileType: z.string().min(1, 'نوع فایل الزامی است'),
  fileSize: z.number().min(1, 'حجم فایل الزامی است'),
  description: z.string().max(500, 'توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد').optional()
});

type Handler = (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching media files', req);
        const { type, search } = req.query;

        const where: any = {};
        if (type) where.type = type;
        if (search) {
          where.OR = [
            { fileName: { contains: search as string, mode: 'insensitive' } },
            { description: { contains: search as string, mode: 'insensitive' } }
          ];
        }

        const media = await prisma.media.findMany({
          where,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        logger.info(`Successfully fetched ${media.length} media files`, req);
        res.status(200).json({
          success: true,
          data: media
        });
      } catch (error) {
        logger.error('Error fetching media files', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در دریافت فایل‌های رسانه‌ای',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        logger.info('Creating new media upload URL', req);
        const mediaData = req.body;

        // Validate request body
        const validationResult = mediaSchema.safeParse(mediaData);
        if (!validationResult.success) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'داده‌های نامعتبر',
              code: 'VALIDATION_ERROR',
              details: validationResult.error.errors 
            }
          });
        }

        // Generate unique file key
        const fileKey = `${user.id}/${uuidv4()}-${mediaData.fileName}`;

        // Create presigned URL for upload
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: fileKey,
          ContentType: mediaData.fileType
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

        // Create media record
        const media = await prisma.media.create({
          data: {
            fileName: mediaData.fileName,
            fileType: mediaData.fileType,
            fileSize: mediaData.fileSize,
            fileKey,
            description: mediaData.description,
            userId: user.id
          }
        });

        logger.info(`Successfully created upload URL for file: ${mediaData.fileName}`, req);
        res.status(201).json({
          success: true,
          data: {
            ...media,
            uploadUrl
          }
        });
      } catch (error) {
        logger.error('Error creating upload URL', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در ایجاد لینک آپلود',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        logger.info(`Deleting media file ${id}`, req);

        if (!id) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'شناسه فایل الزامی است',
              code: 'BAD_REQUEST'
            }
          });
        }

        const media = await prisma.media.findFirst({
          where: {
            id: id as string,
            userId: user.id
          }
        });

        if (!media) {
          logger.warn(`Media file ${id} not found or unauthorized`, req);
          return res.status(404).json({ 
            success: false,
            error: {
              message: 'فایل یافت نشد',
              code: 'NOT_FOUND'
            }
          });
        }

        // Delete from S3
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET!,
          Key: media.fileKey
        });

        await s3Client.send(deleteCommand);

        // Delete from database
        await prisma.media.delete({
          where: { id: id as string }
        });

        logger.info(`Successfully deleted media file ${id}`, req);
        res.status(200).json({ 
          success: true,
          message: 'فایل با موفقیت حذف شد' 
        });
      } catch (error) {
        logger.error('Error deleting media file', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در حذف فایل',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 