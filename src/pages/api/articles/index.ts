import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { z } from 'zod';

const articleSchema = z.object({
  title: z.string().min(3),
  content: z.string().min(10),
  published: z.boolean().optional(),
  authorId: z.string()
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const articles = await prisma.article.findMany({
        include: {
          author: {
            select: { id: true, name: true, email: true }
          }
        }
      });
      return res.status(200).json({ 
        success: true, 
        data: articles 
      });
    }
    case 'POST': {
      const validation = articleSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'داده‌های نامعتبر',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors
          }
        });
      }
      const { title, content, published, authorId } = validation.data;
      const article = await prisma.article.create({
        data: { 
          title, 
          content, 
          published,
          author: {
            connect: { id: authorId }
          }
        }
      });
      return res.status(201).json({ 
        success: true, 
        data: article 
      });
    }
    default:
      (res as any).setHeader('Allow', ['GET', 'POST']);
      return res.status(405).json({ 
        success: false, 
        error: { 
          message: `Method ${req.method} Not Allowed`, 
          code: 'METHOD_NOT_ALLOWED' 
        } 
      });
  }
} 