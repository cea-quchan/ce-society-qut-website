import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import type { ApiResponse } from '@/types/api';

const settingsSchema = z.object({
  siteName: z.string()
    .min(1, 'نام سایت الزامی است')
    .max(100, 'نام سایت نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  siteDescription: z.string()
    .max(500, 'توضیحات سایت نمی‌تواند بیشتر از 500 کاراکتر باشد')
    .optional(),
  siteLogo: z.string().url('آدرس لوگو نامعتبر است').optional(),
  siteFavicon: z.string().url('آدرس فاویکون نامعتبر است').optional(),
  siteKeywords: z.array(z.string()).optional(),
  siteLanguage: z.string().default('fa'),
  siteTimezone: z.string().default('Asia/Tehran'),
  siteEmail: z.string().email('ایمیل نامعتبر است').optional(),
  sitePhone: z.string().optional(),
  siteAddress: z.string().optional(),
  loginOpen: z.boolean().optional(),
  registrationOpen: z.boolean().optional(),
  heroOpen: z.boolean().optional(),
  statsActiveMembers: z.number().int().optional(),
  statsWorkshops: z.number().int().optional(),
  statsCompetitions: z.number().int().optional(),
  socialMedia: z.object({
    instagram: z.string().url('آدرس اینستاگرام نامعتبر است').optional(),
    twitter: z.string().url('آدرس توییتر نامعتبر است').optional(),
    facebook: z.string().url('آدرس فیسبوک نامعتبر است').optional(),
    linkedin: z.string().url('آدرس لینکدین نامعتبر است').optional(),
    youtube: z.string().url('آدرس یوتیوب نامعتبر است').optional()
  }).optional(),
  features: z.object({
    enableComments: z.boolean().default(true),
    enableLikes: z.boolean().default(true),
    enableRegistration: z.boolean().default(true),
    enableEvents: z.boolean().default(true),
    enableArticles: z.boolean().default(true),
    enableMedia: z.boolean().default(true)
  }).optional(),
  limits: z.object({
    maxFileSize: z.number().default(5 * 1024 * 1024), // 5MB
    maxFilesPerUpload: z.number().default(10),
    maxCommentsPerPost: z.number().default(100),
    maxLikesPerUser: z.number().default(1000),
    maxEventsPerUser: z.number().default(50),
    maxArticlesPerUser: z.number().default(100)
  }).optional()
});

type Handler = (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  // Only allow admin users to access settings
  if (user.role !== 'ADMIN') {
    logger.warn(`User ${user.id} attempted to access settings without permission`, req);
    return res.status(403).json({
      success: false,
      error: {
        message: 'شما دسترسی به تنظیمات را ندارید',
        code: 'FORBIDDEN'
      }
    });
  }

  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching settings', req);
        const settings = await prisma.settings.findFirst();  

        if (!settings) {
          logger.warn('No settings found', req);
          return res.status(404).json({
            success: false,
            error: {
              message: 'تنظیمات یافت نشد',
              code: 'NOT_FOUND'
            }
          });
        }

        logger.info('Successfully fetched settings', req);
        res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        logger.error('Error fetching settings', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در دریافت تنظیمات',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'PUT':
      try {
        logger.info('Updating settings', req);
        const settingsData = req.body;

        // Validate request body
        const validationResult = settingsSchema.safeParse(settingsData);
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

        const settings = await prisma.settings.upsert({
          where: { id: '1' },
          update: settingsData,
          create: {
            id: '1',
            ...settingsData
          }
        });

        logger.info('Successfully updated settings', req);
        res.status(200).json({
          success: true,
          data: settings
        });
      } catch (error) {
        logger.error('Error updating settings', error, req);
        res.status(500).json({
          success: false,
          error: {
            message: 'خطا در بروزرسانی تنظیمات',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        error: {
          message: `Method ${req.method} Not Allowed`,
          code: 'METHOD_NOT_ALLOWED'
        }
      });
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 