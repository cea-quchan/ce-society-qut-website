import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
    });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { message: 'ایمیل و رمز عبور الزامی است', code: 'INVALID_INPUT' }
      });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: { message: 'کاربری با این ایمیل یافت نشد', code: 'INVALID_CREDENTIALS' }
      });
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        error: { message: 'رمز عبور اشتباه است', code: 'INVALID_CREDENTIALS' }
      });
    }

    // این endpoint باید حذف یا به /api/auth/callback/credentials (next-auth) منتقل شود.
    return res.status(410).json({
      success: false,
      error: { message: 'این مسیر غیرفعال است. لطفاً از سیستم ورود اصلی استفاده کنید.', code: 'METHOD_NOT_ALLOWED' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطا در ورود به سیستم', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 