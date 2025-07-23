import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";

type ArticleData = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

type DeleteResponse = {
  message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const { id } = req.query;

  try {
    switch (req.method) {
      case 'GET': {
        const article = await prisma.article.findUnique({
          where: { id: id as string },
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
        if (!article) {
          return res.status(404).json({
            success: false,
            error: { message: 'مقاله یافت نشد', code: 'NOT_FOUND' }
          });
        }
        return res.status(200).json({ 
          success: true, 
          data: article as ArticleData 
        });
      }
      case 'PUT': {
        if (!session) {
          return res.status(401).json({
            success: false,
            error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
          });
        }
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
          });
        }
        const { title, content } = req.body;
        const updatedArticle = await prisma.article.update({
          where: { id: id as string },
          data: { title, content },
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
          data: updatedArticle as ArticleData 
        });
      }
      case 'DELETE': {
        if (!session) {
          return res.status(401).json({
            success: false,
            error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
          });
        }
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({
            success: false,
            error: { message: 'شما دسترسی به این بخش را ندارید', code: 'FORBIDDEN' }
          });
        }
        await prisma.article.delete({ where: { id: id as string } });
        return res.status(200).json({ 
          success: true, 
          data: { message: 'مقاله با موفقیت حذف شد' } as DeleteResponse 
        });
      }
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 