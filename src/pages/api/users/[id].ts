import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { normalizeRole } from '@/utils/roleMap';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // استفاده از session/next-auth برای احراز هویت ادمین
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'شما دسترسی به این بخش را ندارید',
        code: 'FORBIDDEN'
      }
    });
  }

  if (req.method === 'GET') {
    // مشاهده اطلاعات کاربر
    const user = await prisma.user.findUnique({
      where: { id: id as string },
      select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true }
    });
    if (!user) return res.status(404).json({
      success: false,
      error: {
        message: 'کاربر یافت نشد',
        code: 'NOT_FOUND'
      }
    });
    return res.status(200).json({
      success: true,
      data: user,
      message: 'اطلاعات کاربر با موفقیت دریافت شد'
    });
  }

  if (req.method === 'PUT') {
    // ویرایش اطلاعات کاربر
    const { name, email, role, password } = req.body;
    if (!name || !email || !role) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'همه فیلدها الزامی است',
          code: 'INVALID_INPUT'
        }
      });
    }
    try {
      const dataToUpdate: any = { name, email, role: normalizeRole(role) };
      if (password && password.length >= 8) {
        dataToUpdate.password = await bcrypt.hash(password, 12);
      }
      const updated = await prisma.user.update({
        where: { id: id as string },
        data: dataToUpdate,
      });
      return res.status(200).json({
        success: true,
        data: updated,
        message: 'کاربر با موفقیت ویرایش شد'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربر یافت نشد یا خطا در ویرایش',
          code: 'NOT_FOUND'
        }
      });
    }
  }

  if (req.method === 'DELETE') {
    // حذف کاربر
    try {
      // Prevent admin from deleting their own account
      if (session.user.id === id) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'ادمین نمی‌تواند حساب خود را حذف کند.',
            code: 'FORBIDDEN'
          }
        });
      }
      await prisma.user.delete({ where: { id: id as string } });
      return res.status(200).json({
        success: true,
        data: null,
        message: 'کاربر حذف شد'
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'کاربر یافت نشد یا خطا در حذف',
          code: 'NOT_FOUND'
        }
      });
    }
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({
    success: false,
    error: {
      message: `Method ${req.method} Not Allowed`,
      code: 'METHOD_NOT_ALLOWED'
    }
  });
} 