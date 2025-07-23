import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { prisma } from "@/lib/prisma";
import { PaginatedData } from '@/types/api';

interface Session {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

type MessageData = {
  id: string;
  content: string;
  createdAt: Date;
  read: boolean;
  senderId: string;
  receiverId: string;
  metadata: any;
  sender: {
    id: string;
    name: string;
    email: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions) as Session | null;

  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'لطفا وارد حساب کاربری خود شوید', code: 'UNAUTHORIZED' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        const { receiverId, page = '1', limit = '20' } = req.query;
        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);

        if (!receiverId) {
          return res.status(400).json({
            success: false,
            error: { message: 'شناسه گیرنده الزامی است', code: 'VALIDATION_ERROR' }
          });
        }

        const [messages, total] = await Promise.all([
          prisma.message.findMany({
            where: { 
              OR: [
                { senderId: session.user.id, receiverId: receiverId as string },
                { senderId: receiverId as string, receiverId: session.user.id }
              ]
            },
            include: {
              sender: {
                select: {
                  id: true,
                  name: true,
                  email: true
                }
              }
            },
            orderBy: { createdAt: 'desc' },
            skip: (pageNumber - 1) * limitNumber,
            take: limitNumber
          }),
          prisma.message.count({
            where: { 
              OR: [
                { senderId: session.user.id, receiverId: receiverId as string },
                { senderId: receiverId as string, receiverId: session.user.id }
              ]
            }
          })
        ]);

        const paginated: PaginatedData<MessageData> = {
          items: messages as MessageData[],
          pagination: {
            total,
            currentPage: pageNumber,
            limit: limitNumber,
            totalPages: Math.ceil(total / limitNumber)
          }
        };

        return res.status(200).json({
          success: true,
          data: paginated
        });
      }
      case 'POST': {
        const { content, receiverId } = req.body;

        if (!content || !receiverId) {
          return res.status(400).json({
            success: false,
            error: { message: 'محتوا و شناسه گیرنده الزامی است', code: 'INVALID_INPUT' }
          });
        }

        const message = await prisma.message.create({
          data: {
            content,
            senderId: session.user.id,
            receiverId
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        });

        return res.status(201).json({
          success: true,
          data: message as MessageData
        });
      }
      default:
        if (res.setHeader) {
          res.setHeader('Allow', ['GET', 'POST']);
        }
        return res.status(405).json({
          success: false,
          error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Error handling messages:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 