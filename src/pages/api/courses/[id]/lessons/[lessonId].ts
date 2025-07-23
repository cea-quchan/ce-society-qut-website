import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const { id, lessonId } = req.query;

  if (!id || typeof id !== 'string' || !lessonId || typeof lessonId !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid course or lesson ID',
        code: 'BAD_REQUEST'
      }
    });
  }

  if (req.method === 'GET') {
    const lesson = await prisma.lesson.findUnique({
      where: {
        id: lessonId,
        courseId: id
      }
    });

    if (!lesson) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Lesson not found',
          code: 'NOT_FOUND'
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: lesson
    });
  }

  if (req.method === 'PUT') {
    const { title, description, content, order, duration, type } = req.body;

    const lesson = await prisma.lesson.update({
      where: {
        id: lessonId,
        courseId: id
      },
      data: {
        title,
        description,
        content,
        order,
        duration,
        type
      }
    });

    return res.status(200).json({
      success: true,
      data: lesson
    });
  }

  if (req.method === 'DELETE') {
    await prisma.lesson.delete({
      where: {
        id: lessonId,
        courseId: id
      }
    });

    return res.status(200).json({
      success: true,
      data: { message: 'Lesson deleted successfully' }
    });
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return res.status(405).json({
    success: false,
    error: {
      message: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED'
    }
  });
};

export default handler; 