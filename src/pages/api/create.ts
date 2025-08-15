import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { withApiMiddleware } from '@/middleware';
import type { ApiHandler } from '@/types/api';
import { createApiResponse, createErrorResponse } from '@/lib/apiResponse';
import { normalizeRole } from '@/utils/roleMap';

const userSchema = z.object({
  name: z.string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از 50 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد'),
  role: z.enum(['USER', 'ADMIN', 'INSTRUCTOR']).default('USER'),
  image: z.string().url('آدرس تصویر نامعتبر است').optional(),
  bio: z.string().max(500, 'بیوگرافی نمی‌تواند بیشتر از 500 کاراکتر باشد').optional()
});

type CreatedUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  points: number;
  createdAt: Date;
};

const handler: ApiHandler<CreatedUser> = async (req, res, user) => {
  if (req.method !== 'POST') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, error: { message: `متد ${req.method} مجاز نیست`, code: 'METHOD_NOT_ALLOWED' } });
  }

  try {
    logger.info('Creating new user', req);
    const userData = req.body;

    // Validate request body
    const validationResult = userSchema.safeParse(userData);
    if (!validationResult.success) {
      return res.status(400).json({ success: false, error: { message: 'داده‌های نامعتبر', code: 'VALIDATION_ERROR', details: validationResult.error.errors } });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      logger.warn(`Attempted to create user with existing email: ${userData.email}`, req);
      return res.status(400).json({ success: false, error: { message: 'این ایمیل قبلاً ثبت شده است', code: 'EMAIL_EXISTS' } });
    }

    // Hash password
    const hashedPassword = await hash(userData.password, 12);

    const newUser = await prisma.user.create({
      data: {
        ...userData,
        role: normalizeRole(userData.role),
        password: hashedPassword,
        active: true, // همه کاربران جدید فعال باشند
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        points: true,
        createdAt: true
      }
    });

    logger.info(`Successfully created user with ID: ${newUser.id}`, req);
    return res.status(200).json(createApiResponse(newUser));
  } catch (error) {
    logger.error('Error creating user', error, req);
    return res.status(500).json({ success: false, error: { message: 'خطا در ایجاد کاربر', code: 'CREATE_ERROR' } });
  }
};

// Apply middleware
export default withApiMiddleware(handler); 