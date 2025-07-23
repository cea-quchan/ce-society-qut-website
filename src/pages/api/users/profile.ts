import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { handleFileUpload } from '@/lib/upload';
import bcrypt from 'bcryptjs';
import { ApiResponse } from '@/types/api';
type UserProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  points: number;
  createdAt: Date;
  updatedAt: Date;
};

async function handler(req: NextApiRequest, res: NextApiResponse, user?: UserProfile) {
  switch (req.method) {
    case 'GET':
      try {
        if (!user) {
          return res.status(401).json({
            success: false,
            error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
          });
        }
        logger.info(`Fetching profile for user ${user.id}`, req);
        const profile = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            points: true,
            createdAt: true,
            updatedAt: true
          }
        });

        if (!profile) {
          logger.warn(`Profile not found for user ${user.id}`, req);
          return res.status(404).json({ 
            success: false,
            error: {
              message: 'پروفایل یافت نشد',
              code: 'NOT_FOUND'
            }
          });
        }

        logger.info(`Successfully fetched profile for user ${user.id}`, req);
        // فقط فیلدهای UserProfile را برگردان
        if (!profile) {
          return res.status(404).json({
            success: false,
            error: { message: 'Profile not found', code: 'NOT_FOUND' }
          });
        }
        const userProfile: UserProfile = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          role: profile.role,
          points: profile.points,
          createdAt: profile.createdAt ?? new Date(),
          updatedAt: profile.updatedAt
        };
        return res.status(200).json({ success: true, data: userProfile });
      } catch (error) {
        logger.error('Error fetching profile', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در دریافت پروفایل',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'PUT':
      try {
        if (!user) {
          return res.status(401).json({
            success: false,
            error: { message: 'Unauthorized', code: 'UNAUTHORIZED' }
          });
        }
        logger.info(`Updating profile for user ${user.id}`, req);
        
        const { name, email, currentPassword, newPassword } = req.body;
        const updateData: Record<string, any> = {};

        // Handle profile image upload
        if (req.headers['content-type']?.includes('multipart/form-data')) {
          const imageUrl = await handleFileUpload(req);
          updateData.image = imageUrl;
        }

        // Update basic info
        if (name) updateData.name = name;
        if (email) updateData.email = email;

        // Handle password change
        if (currentPassword && newPassword) {
          const currentUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { password: true }
          });

          if (!currentUser) {
            logger.warn(`User not found for password update: ${user?.id}`, req);
            return res.status(404).json({ 
              success: false,
              error: {
                message: 'کاربر یافت نشد',
                code: 'NOT_FOUND'
              }
            });
          }

          const isValidPassword = await bcrypt.compare(currentPassword, currentUser.password || '');
          if (!isValidPassword) {
            logger.warn(`Invalid current password for user ${user?.id}`, req);
            return res.status(400).json({ 
              success: false,
              error: {
                message: 'رمز عبور فعلی اشتباه است',
                code: 'INVALID_CREDENTIALS'
              }
            });
          }

          updateData.password = await bcrypt.hash(newPassword, 10);
        }

        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: updateData,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            points: true,
            createdAt: true,
            updatedAt: true
          }
        });
        logger.info(`Successfully updated profile for user ${user?.id}`, req);
        const updatedProfile: UserProfile = {
          id: updatedUser.id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          points: updatedUser.points,
          createdAt: updatedUser.createdAt ?? new Date(),
          updatedAt: updatedUser.updatedAt
        };
        return res.status(200).json({ success: true, data: updatedProfile });
      } catch (error) {
        logger.error('Error updating profile', error, req);
        res.status(500).json({ 
          success: false,
          error: {
            message: 'خطا در بروزرسانی پروفایل',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      logger.warn(`Method ${req.method} not allowed`, req);
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({
        success: false,
        error: {
          message: `Method ${req.method} Not Allowed`,
          code: 'METHOD_NOT_ALLOWED'
        }
      });
  }
}

// Apply middleware
export default withRateLimit(
  withAuth(handler),
  { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
); 