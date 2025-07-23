import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { normalizeRole } from '@/utils/roleMap';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      // صفحه‌بندی
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;
      const [total, users] = await Promise.all([
        prisma.user.count(),
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      ]);
      return res.status(200).json({ success: true, data: { users, total, page, limit } });
    } catch {
      return res.status(500).json({ success: false, error: { message: 'خطا در دریافت کاربران', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  if (req.method === 'POST') {
    try {
      const { email, name, password, role } = req.body;
      if (!email || !name || !password || !role) {
        return res.status(400).json({ success: false, error: { message: 'همه فیلدها الزامی است', code: 'BAD_REQUEST' } });
      }
      // اعتبارسنجی ایمیل و رمز عبور و نام
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, error: { message: 'ایمیل نامعتبر است', code: 'BAD_REQUEST' } });
      }
      if (password.length < 8) {
        return res.status(400).json({ success: false, error: { message: 'رمز عبور باید حداقل 8 کاراکتر باشد', code: 'BAD_REQUEST' } });
      }
      // بررسی تکراری نبودن ایمیل
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        return res.status(400).json({ success: false, error: { message: 'این ایمیل قبلاً ثبت شده است', code: 'EMAIL_EXISTS' } });
      }
      // رمزنگاری رمز عبور
      const hashedPassword = await bcrypt.hash(password, 12);
      const user = await prisma.user.create({
        data: { email, name, password: hashedPassword, role: normalizeRole(role) },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return res.status(201).json({ success: true, data: user });
    } catch {
      return res.status(500).json({ success: false, error: { message: 'خطا در ایجاد کاربر', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
};

export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 }
  )
); 