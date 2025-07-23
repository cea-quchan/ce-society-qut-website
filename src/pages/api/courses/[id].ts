import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import type { ApiResponse } from '@/types/api';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'شناسه دوره الزامی است', code: 'INVALID_INPUT' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const course = await prisma.course.findUnique({
          where: { id },
          include: {
            instructor: true,
            lessons: true
          }
        });

        if (!course) {
          return res.status(404).json({
            success: false,
            error: { message: 'دوره یافت نشد', code: 'NOT_FOUND' }
          });
        }

        return res.status(200).json({ success: true, data: course });
      }

      case 'PUT': {
        const { title, description, startDate, endDate, capacity, price } = req.body;
        if (!title || !description || !startDate || !endDate || !capacity || !price) {
          return res.status(400).json({
            success: false,
            error: { message: 'همه فیلدها الزامی است', code: 'INVALID_INPUT' }
          });
        }
        try {
          const updatedCourse = await prisma.course.update({
            where: { id },
            data: {
              title,
              description,
              startDate: new Date(startDate),
              endDate: new Date(endDate),
              capacity: parseInt(capacity),
              price: parseFloat(price)
            },
            include: {
              instructor: true,
              lessons: true
            }
          });
          return res.status(200).json({ success: true, data: updatedCourse });
        } catch (e) {
          return res.status(404).json({
            success: false,
            error: { message: 'دوره یافت نشد یا خطا در ویرایش', code: 'NOT_FOUND' }
          });
        }
      }

      case 'DELETE': {
        try {
          await prisma.course.delete({
            where: { id }
          });
          return res.status(200).json({ success: true, data: { message: 'دوره با موفقیت حذف شد' } });
        } catch (e) {
          return res.status(404).json({
            success: false,
            error: { message: 'دوره یافت نشد یا خطا در حذف', code: 'NOT_FOUND' }
          });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling course:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 