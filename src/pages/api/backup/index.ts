import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';
import { logger } from '@/lib/logger';

const execAsync = promisify(exec);

const backupSchema = z.object({
  includeMedia: z.boolean().default(true),
  includeLogs: z.boolean().default(true),
  description: z.string().max(500, 'توضیحات نمی‌تواند بیشتر از 500 کاراکتر باشد').optional()
});

type BackupData = {
  id: string;
  createdAt: Date;
  description: string | null;
  filename: string;
  size: string;
  createdBy: string;
};

type DeleteResponse = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  if (session.user.role !== 'ADMIN') {
    logger.warn(`User ${session.user.id} attempted to access backup without permission`, req);
    return res.status(403).json({
      success: false,
      error: { message: 'شما دسترسی به خروجی‌گیری را ندارید', code: 'FORBIDDEN' }
    });
  }

  switch (req.method) {
    case 'GET': {
      try {
        logger.info('Fetching backup history', req);
        const backups = await prisma.backup.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({
          success: true,
          data: backups
        });
      } catch (error) {
        logger.error('Error fetching backup history', error, req);
        return res.status(500).json({
          success: false,
          error: { message: 'خطا در دریافت تاریخچه خروجی‌گیری', code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }

    case 'POST': {
      try {
        const backupData = req.body;
        const backup = await prisma.backup.create({
          data: {
            description: backupData.description,
            filename: backupData.filename,
            size: backupData.size,
            createdBy: session.user.id
          }
        });
        return res.status(201).json({
          success: true,
          data: backup
        });
      } catch (error) {
        logger.error('Error creating backup', error, req);
        return res.status(500).json({
          success: false,
          error: { message: 'خطا در ایجاد خروجی', code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }

    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          success: false,
          error: { message: 'شناسه خروجی الزامی است', code: 'INVALID_INPUT' }
        });
      }

      try {
        await prisma.backup.delete({
          where: { id: id as string }
        });
        return res.status(200).json({
          success: true,
          data: { message: 'خروجی با موفقیت حذف شد' }
        });
      } catch (error) {
        logger.error('Error deleting backup', error, req);
        return res.status(500).json({
          success: false,
          error: { message: 'خطا در حذف خروجی', code: 'INTERNAL_SERVER_ERROR' }
        });
      }
    }

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      if (res.setHeader) {
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      }
      return res.status(405).json({
        success: false,
        error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
      });
  }
} 