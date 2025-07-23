import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import { Server as SocketIOServer } from 'socket.io';
import { Server as NetServer } from 'http';
import { Prisma } from '@prisma/client';

interface SocketServer extends NetServer {
  io?: SocketIOServer;
}

// تعریف تایپ برای درخواست‌های API با پشتیبانی از Socket.IO
type NextApiRequestWithSocket = NextApiRequest & {
  socket: {
    server: SocketServer;
  };
};

const messageSchema = z.object({
  content: z.string()
    .min(1, 'پیام نمی‌تواند خالی باشد')
    .max(1000, 'پیام نمی‌تواند بیشتر از 1000 کاراکتر باشد'),
  receiverId: z.string().min(1, 'شناسه گیرنده الزامی است'),
  attachments: z.array(z.object({
    type: z.enum(['image', 'file']),
    url: z.string().url(),
    name: z.string()
  })).optional()
});

type Handler = (req: NextApiRequestWithSocket, res: NextApiResponse, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  switch (req.method) {
    case 'GET':
      try {
        logger.info('Fetching messages', req);
        
        const { userId } = req.query;
        if (!userId) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'شناسه کاربر الزامی است',
              code: 'BAD_REQUEST'
            }
          });
        }

        const messages = await prisma.message.findMany({
          where: {
            OR: [
              { senderId: user.id, receiverId: userId as string },
              { senderId: userId as string, receiverId: user.id }
            ]
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        // Mark unread messages as read
        await prisma.message.updateMany({
          where: {
            receiverId: user.id,
            senderId: userId as string,
            read: false
          },
          data: {
            read: true
          }
        });

        logger.info(`Successfully fetched ${messages.length} messages`, req);
        res.status(200).json({
          success: true,
          data: messages
        });
      } catch (error) {
        logger.error('Error fetching messages', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در دریافت پیام‌ها',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        logger.info('Creating new message', req);
        const messageData = req.body;

        // Validate request body
        const validationResult = messageSchema.safeParse(messageData);
        if (!validationResult.success) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'داده‌های نامعتبر',
              code: 'VALIDATION_ERROR',
              details: validationResult.error.errors 
            }
          });
        }

        const { content, receiverId, attachments } = validationResult.data;

        // Check if receiver exists
        const receiver = await prisma.user.findUnique({
          where: { id: receiverId }
        });

        if (!receiver) {
          logger.warn(`Attempted to send message to non-existent user: ${receiverId}`, req);
          return res.status(404).json({ 
            success: false,
            error: {
              message: 'کاربر مورد نظر یافت نشد',
              code: 'NOT_FOUND'
            }
          });
        }

        const message = await prisma.message.create({
          data: {
            content: content,
            senderId: user.id,
            receiverId: receiverId,
            metadata: attachments ? { attachments } : undefined
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                image: true,
                role: true
              }
            }
          }
        });

        // Emit message through Socket.IO
        const io = req.socket.server.io;
        if (io) {
          io.to(receiverId).emit('message', message);
          logger.info(`Message emitted to user ${receiverId}`, req);
        }

        logger.info(`Successfully created message with ID: ${message.id}`, req);
        res.status(201).json({
          success: true,
          data: message
        });
      } catch (error) {
        logger.error('Error creating message', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در ارسال پیام',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'DELETE':
      try {
        const { id } = req.query;
        logger.info(`Deleting message ${id}`, req);

        if (!id) {
          return res.status(400).json({ 
            success: false,
            error: {
              message: 'شناسه پیام الزامی است',
              code: 'BAD_REQUEST'
            }
          });
        }

        const message = await prisma.message.findFirst({
          where: {
            id: id as string,
            OR: [
              { senderId: user.id },
              { receiverId: user.id }
            ]
          }
        });

        if (!message) {
          logger.warn(`Message ${id} not found or unauthorized`, req);
          return res.status(404).json({ 
            success: false,
            error: {
              message: 'پیام یافت نشد',
              code: 'NOT_FOUND'
            }
          });
        }

        await prisma.message.delete({
          where: { id: id as string }
        });

        logger.info(`Successfully deleted message ${id}`, req);
        res.status(200).json({ 
          success: true,
          message: 'پیام با موفقیت حذف شد' 
        });
      } catch (error) {
        logger.error('Error deleting message', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در حذف پیام',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler as any),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 