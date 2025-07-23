import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import { createObjectCsvWriter } from 'csv-writer';
import { join } from 'path';
import { createGzip } from 'zlib';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import { ApiResponse, ApiError, ErrorCode } from '@/types/api';

const exportSchema = z.object({
  type: z.enum(['users', 'events', 'articles', 'comments', 'likes', 'participants', 'media']),
  format: z.enum(['csv', 'json']).default('csv'),
  filters: z.record(z.any()).optional(),
  fields: z.array(z.string()).optional()
});

type Handler = (req: NextApiRequest, res: NextApiResponse, user?: any) => Promise<void>;

const createSelectObject = (fields: string[] | undefined): Record<string, boolean> | undefined => {
  if (!fields) return undefined;
  return fields.reduce((acc: Record<string, boolean>, field: string) => ({ ...acc, [field]: true }), {});
};

const handler: Handler = async (req, res, user) => {
  // Only allow admin users to access export
  if (user.role !== 'ADMIN') {
    logger.warn(`User ${user.id} attempted to access export without permission`, req);
    return res.status(403).json({ 
      success: false,
      error: {
        message: 'شما دسترسی به خروجی‌گیری را ندارید',
        code: 'FORBIDDEN'
      }
    });
  }

  switch (req.method) {
    case 'POST':
      try {
        logger.info('Creating export', req);
        const exportData = req.body;

        // Validate request body
        const validationResult = exportSchema.safeParse(exportData);
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

        // Get data based on type
        let data: any[];
        const selectObject = createSelectObject(exportData.fields);

        switch (exportData.type) {
          case 'users':
            data = await prisma.user.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'events':
            data = await prisma.event.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'articles':
            data = await prisma.article.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'comments':
            data = await prisma.comment.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'likes':
            data = await prisma.like.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'participants':
            data = await prisma.eventParticipant.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          case 'media':
            data = await prisma.media.findMany({
              where: exportData.filters,
              select: selectObject
            });
            break;
          default:
            return res.status(400).json({ 
              success: false,
              error: {
                message: 'نوع خروجی نامعتبر است',
                code: 'BAD_REQUEST'
              }
            });
        }

        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${exportData.type}-${timestamp}.${exportData.format}.gz`;
        const filepath = join(process.cwd(), 'exports', filename);
        const tempFilepath = filepath.replace('.gz', '');

        // Create exports directory if it doesn't exist
        await prisma.$executeRaw`CREATE DIRECTORY IF NOT EXISTS exports`;

        if (exportData.format === 'csv') {
          // Convert data to CSV
          const csvWriter = createObjectCsvWriter({
            path: tempFilepath,
            header: Object.keys(data[0] || {}).map(key => ({ id: key, title: key }))
          });

          await csvWriter.writeRecords(data);

          // Compress file
          await pipeline(
            createReadStream(tempFilepath),
            createGzip(),
            createWriteStream(filepath)
          );
        } else {
          // Write JSON file
          const jsonString = JSON.stringify(data, null, 2);
          await pipeline(
            createReadStream(Buffer.from(jsonString)),
            createGzip(),
            createWriteStream(filepath)
          );
        }

        // Create export record
        const exportRecord = {
          id: `export-${Date.now()}`,
          type: exportData.type,
          format: exportData.format,
          filename,
          size: '0', // Will be calculated later
          createdBy: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        logger.info(`Successfully created export with ID: ${exportRecord.id}`, req);
        res.status(201).json({
          success: true,
          data: exportRecord
        });
      } catch (error) {
        logger.error('Error creating export', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در ایجاد خروجی',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'GET':
      try {
        logger.info('Fetching export history', req);
        // For now, return empty array since we don't have a proper export table
        const exports: any[] = [];

        logger.info(`Successfully fetched ${exports.length} exports`, req);
        res.status(200).json({
          success: true,
          data: exports
        });
      } catch (error) {
        logger.error('Error fetching export history', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در دریافت تاریخچه خروجی‌گیری',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST']);
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