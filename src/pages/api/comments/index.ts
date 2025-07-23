import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { z } from 'zod';

const commentSchema = z.object({
  content: z.string().min(1, 'محتوا نمی‌تواند خالی باشد').max(1000, 'محتوا نمی‌تواند بیشتر از 1000 کاراکتر باشد'),
  postId: z.string().min(1, 'شناسه پست الزامی است'),
  postType: z.enum(['event', 'article', 'forum', 'webinar'], { errorMap: () => ({ message: 'نوع پست نامعتبر است' }) }),
  parentId: z.string().optional()
});

type CommentData = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  articleId: string | null;
  eventId: string | null;
  forumPostId: string | null;
  webinarId: string | null;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

type DeleteResponse = {
  message: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const comments = await prisma.comment.findMany({
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({
          success: true,
          data: comments
        });
      }
      case 'POST': {
        const { content, postId, postType } = req.body;

        if (!content || !postId || !postType) {
          return res.status(400).json({
            success: false,
            error: { message: 'تمام فیلدها الزامی هستند', code: 'INVALID_INPUT' }
          });
        }

        const comment = await prisma.comment.create({
          data: {
            content,
            authorId: session.user.id,
            ...(postType === 'article' && { articleId: postId }),
            ...(postType === 'event' && { eventId: postId }),
            ...(postType === 'forum' && { forumPostId: postId }),
            ...(postType === 'webinar' && { webinarId: postId })
          },
          include: {
            author: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });
        return res.status(200).json({
          success: true,
          data: comment
        });
      }
      case 'DELETE': {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            success: false,
            error: { message: 'شناسه نظر الزامی است', code: 'INVALID_INPUT' }
          });
        }

        await prisma.comment.delete({
          where: { id: id as string }
        });
        return res.status(200).json({ 
          success: true, 
          data: { message: 'نظر با موفقیت حذف شد' } as DeleteResponse 
        });
      }
      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        }
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling comments:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
}
