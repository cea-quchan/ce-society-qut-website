import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: { message: 'شناسه دوره الزامی است', code: 'INVALID_INPUT' }
    });
  }

  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        error: { message: 'دوره یافت نشد', code: 'NOT_FOUND' }
      });
    }

    const response = {
      success: true,
      data: {
        items: course.lessons,
        pagination: {
          total: course.lessons.length,
          currentPage: 1,
          limit: course.lessons.length,
          totalPages: 1
        }
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching course lessons:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
};

export default handler; 