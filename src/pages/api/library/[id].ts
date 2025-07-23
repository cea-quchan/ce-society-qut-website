import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { ApiResponse, ErrorCode } from '@/types/api';
import { promises as fs } from 'fs';
import path from 'path';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'GET' && req.method !== 'PUT' && req.method !== 'DELETE') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED' as ErrorCode
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    logger.warn('Unauthorized access attempt', req);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED' as ErrorCode
      }
    });
  }

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      const item = await prisma.libraryResource.findUnique({
        where: { id: String(id) },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        }
      });

      if (!item) {
        logger.warn(`Library item ${id} not found`, req);
        return res.status(404).json({
          success: false,
          error: {
            message: 'Item not found',
            code: 'NOT_FOUND' as ErrorCode
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: item
      });
    }

    if (req.method === 'PUT') {
      const { title, description, category, fileUrl } = req.body;

      if (!title || !description || !category) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Missing required fields',
            code: 'BAD_REQUEST' as ErrorCode
          }
        });
      }

      const item = await prisma.libraryResource.update({
        where: { id: String(id) },
        data: {
          title,
          description,
          category,
          ...(fileUrl && { fileUrl })
        }
      });

      return res.status(200).json({
        success: true,
        data: item
      });
    }

    if (req.method === 'DELETE') {
      const item = await prisma.libraryResource.findUnique({
        where: { id: String(id) }
      });

      if (!item) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Item not found',
            code: 'NOT_FOUND' as ErrorCode
          }
        });
      }

      // Delete file if exists
      if (item.fileUrl) {
        const filePath = path.join(process.cwd(), 'public', item.fileUrl);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          logger.error('Error deleting file', error, req);
        }
      }

      await prisma.libraryResource.delete({
        where: { id: String(id) }
      });

      return res.status(200).json({
        success: true,
        message: 'Item deleted successfully'
      });
    }
  } catch (error) {
    logger.error('Error processing library item', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error processing library item',
        code: 'INTERNAL_SERVER_ERROR' as ErrorCode
      }
    });
  }
};

export default handler; 