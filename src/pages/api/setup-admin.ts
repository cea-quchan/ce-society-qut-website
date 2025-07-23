import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';

const setupAdminSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد').max(100, 'نام نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string().min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد'),
  secretKey: z.string().min(1, 'کلید امنیتی الزامی است')
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
    });
  }

  try {
    // بررسی کلید امنیتی
    const expectedSecretKey = process.env.ADMIN_SETUP_SECRET || 'qiet-admin-2024';
    
    if (req.body.secretKey !== expectedSecretKey) {
      return res.status(403).json({
        success: false,
        error: { message: 'کلید امنیتی نامعتبر است', code: 'INVALID_SECRET' }
      });
    }

    // بررسی وجود ادمین قبلی
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        error: { message: 'ادمین قبلاً ایجاد شده است', code: 'ADMIN_EXISTS' }
      });
    }

    const validatedData = setupAdminSchema.parse(req.body);

    // بررسی وجود کاربر با این ایمیل
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { message: 'کاربری با این ایمیل قبلاً وجود دارد', code: 'USER_EXISTS' }
      });
    }

    // هش کردن رمز عبور
    const hashedPassword = await hash(validatedData.password, 12);

    // ایجاد کاربر ادمین
    const adminUser = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role
      },
      message: 'کاربر ادمین با موفقیت ایجاد شد'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'داده‌های نامعتبر',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      });
    }

    console.error('Error setting up admin:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطا در ایجاد کاربر ادمین', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 