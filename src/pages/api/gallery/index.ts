import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import type { ApiResponse, ErrorCode, PaginatedResponse } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  category: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

const galleryItemSchema = z.object({
  title: z.string().min(1, 'عنوان الزامی است'),
  description: z.string().min(1, 'توضیحات الزامی است'),
  url: z.string().url('آدرس تصویر نامعتبر است'),
  category: z.string().min(1, 'دسته‌بندی الزامی است'),
});

type Handler = (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

const handler: Handler = async (req, res) => {
  if (req.method !== 'GET') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED' as ErrorCode
      }
    });
  }

  try {
    const { page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where = {};

    const [total, items] = await Promise.all([
      prisma.galleryItem.count({ where }),
      prisma.galleryItem.findMany({
        where,
        skip,
        take,
        orderBy: { order: 'asc' },
        include: {
          uploader: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          currentPage: parseInt(page as string),
          limit: take,
          totalPages: Math.ceil(total / take)
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching gallery items', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching gallery items',
        code: 'INTERNAL_SERVER_ERROR' as ErrorCode
      }
    });
  }
};

// Apply middleware without rate limiting for testing
export default withSecurity(handler as any); 