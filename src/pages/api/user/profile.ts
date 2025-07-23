import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { ApiResponse } from '@/types/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiResponse<{ id: string; name: string; email: string; role: string; createdAt: Date; updatedAt: Date }>>) {
  console.log('API Route: /api/user/profile');
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));

  // استفاده از session/next-auth برای احراز هویت
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({
      success: false,
      error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
    });
  }

  try {
    switch (req.method) {
      case 'GET': {
        // Get user from database
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!user) {
          console.log('User not found:', session.user.id);
          return res.status(404).json({
            success: false,
            error: { message: 'Not found', code: 'NOT_FOUND' }
          });
        }

        console.log('Found user:', user);
        return res.status(200).json({ success: true, data: user });
      }

      case 'PUT': {
        const { name, email } = req.body;
        console.log('Update data:', { name, email });

        // Validate input
        if (!name && !email) {
          console.log('No update fields provided');
          return res.status(400).json({
            success: false,
            error: { message: 'Bad request', code: 'BAD_REQUEST' }
          });
        }

        // Check if email is already taken
        if (email) {
          const existingUser = await prisma.user.findFirst({
            where: {
              email,
              id: { not: session.user.id }
            }
          });

          if (existingUser) {
            console.log('Email already taken:', email);
            return res.status(400).json({
              success: false,
              error: { message: 'Bad request', code: 'BAD_REQUEST' }
            });
          }
        }

        // Update user
        try {
          const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
              ...(name && { name }),
              ...(email && { email })
            },
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true
            }
          });

          console.log('User updated successfully:', updatedUser);
          return res.status(200).json({ success: true, data: updatedUser });
        } catch (error) {
          console.error('Error updating user:', error);
          return res.status(500).json({
            success: false,
            error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' }
          });
        }
      }

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({
          success: false,
          error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
        });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 