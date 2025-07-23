import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<{ message: string }>>
) {
  console.log('API Route: /api/user/password');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).json({ success: false, error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' } });
  }

  // استفاده از session/next-auth برای احراز هویت
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ success: false, error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' } });
  }

  try {
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, error: { message: 'لطفا رمز عبور فعلی و جدید را وارد کنید', code: 'BAD_REQUEST' } });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'کاربر یافت نشد', code: 'NOT_FOUND' } });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: { message: 'رمز عبور فعلی اشتباه است', code: 'UNAUTHORIZED' } });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword }
    });

    return res.status(200).json({ success: true, data: { message: 'رمز عبور با موفقیت تغییر کرد' } });
  } catch (error) {
    console.error('Password change error:', error);
    return res.status(500).json({ success: false, error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' } });
  }
} 