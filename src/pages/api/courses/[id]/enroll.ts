import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === 'POST') {
    const { userId } = req.body;
    // پیدا کردن دوره
    const course = await prisma.course.findUnique({ where: { id: id as string } });
    if (!course) {
      return res.status(404).json({ success: false, error: { message: 'Course not found', code: 'COURSE_NOT_FOUND' } });
    }
    // پیدا کردن کاربر
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } });
    }
    // بررسی ثبت‌نام قبلی
    const existing = await prisma.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: id as string, userId } }
    });
    if (existing) {
      return res.status(400).json({ success: false, error: { message: 'User already enrolled', code: 'ALREADY_ENROLLED' } });
    }
    // ثبت‌نام کاربر در دوره
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        courseId: id as string,
        userId,
      },
      include: {
        course: { select: { id: true, title: true } },
        user: { select: { id: true, name: true, email: true } }
      }
    });
    return res.status(201).json({ success: true, data: enrollment });
  }

  res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
} 