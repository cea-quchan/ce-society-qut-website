import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { ApiResponse, ApiError } from '@/types/api';

type LikeData = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  articleId: string | null;
  eventId: string | null;
  webinarId: string | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET': {
      const likes = await prisma.like.findMany();
      return res.status(200).json({
        success: true,
        data: likes
      });
    }
    default:
      (res as any).setHeader('Allow', ['GET']);
      return res.status(405).json({ 
        success: false, 
        error: { 
          message: `Method ${req.method} Not Allowed`, 
          code: 'METHOD_NOT_ALLOWED' 
        } 
      });
  }
} 