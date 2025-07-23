import { NextApiRequest, NextApiResponse } from 'next';
import { ApiResponse } from '@/types/api';
import { prisma } from "@/lib/prisma";
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { AppError } from '@/middleware/error';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      }
    });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'Invalid webinar ID',
        code: 'BAD_REQUEST'
      }
    });
  }

  try {
    switch (req.method) {
      case 'GET':
        const webinar = await prisma.webinar.findUnique({
          where: { id }
        });

        if (!webinar) {
          return res.status(404).json({
            success: false,
            error: {
              message: 'Webinar not found',
              code: 'NOT_FOUND'
            }
          });
        }

        return res.status(200).json({ success: true, data: webinar });

      case 'PUT':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ 
            success: false,
            error: {
              message: 'شما دسترسی به ویرایش این وبینار را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        const { title, description, startDate, endDate, capacity, location, status } = req.body;

        if (!title || !description || !startDate || !endDate || !capacity || !location || !status) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'تمام فیلدهای الزامی را پر کنید',
              code: 'BAD_REQUEST'
            }
          });
        }

        const updateData: any = {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          location
        };
        // Only add status if it exists in the model
        if ('status' in prisma.webinar.fields && status) {
          updateData.status = String(status);
        }
        const updatedWebinar = await prisma.webinar.update({
          where: {
            id: String(id)
          },
          data: updateData,
          include: {
            host: {
              select: {
                id: true,
                name: true,
                image: true
              }
            },
            participants: {
              select: {
                id: true,
                userId: true
              }
            }
          }
        });
        return res.status(200).json({ success: true, data: updatedWebinar });

      case 'DELETE':
        if (session.user.role !== 'ADMIN') {
          return res.status(403).json({ 
            success: false,
            error: {
              message: 'شما دسترسی به حذف این وبینار را ندارید',
              code: 'FORBIDDEN'
            }
          });
        }

        await prisma.webinar.delete({
          where: {
            id: String(id)
          }
        });

        return res.status(204).end();

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: {
            message: 'Method not allowed',
            code: 'METHOD_NOT_ALLOWED'
          }
        });
    }
  } catch (error) {
    if (error instanceof AppError) {
      return res.status(error.statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
    return res.status(500).json({
      success: false,
      error: {
        message: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
} 