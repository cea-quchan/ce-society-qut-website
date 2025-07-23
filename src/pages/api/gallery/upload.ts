import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { writeFile } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const createdFilePaths: string[] = [];
  if (req.method !== 'POST') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED'
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    logger.warn('Unauthorized upload attempt', req);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED'
      }
    });
  }

  try {
    const { title, description, category, file, files } = req.body;

    if (!title || !category || (!file && !files)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'BAD_REQUEST'
        }
      });
    }

    if (!session.user?.id) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not authenticated',
          code: 'UNAUTHORIZED'
        }
      });
    }

    // Batch upload
    const fileList = Array.isArray(files) ? files : (file ? [file] : []);
    const createdItems = [];
    for (const f of fileList) {
      // اگر f یک لینک اینترنتی بود
      if (typeof f === 'string' && (f.startsWith('http://') || f.startsWith('https://'))) {
        const item = await prisma.galleryItem.create({
          data: {
            title,
            description,
            imageUrl: f,
            uploaderId: session.user.id,
            category
          }
        });
        createdItems.push(item);
        continue;
      }
      // Validate file type and size (base64)
      const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(f);
      if (!matches) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'فرمت فایل فقط باید JPG یا PNG باشد',
            code: 'INVALID_FILE_TYPE'
          }
        });
      }
      // Calculate file size in bytes
      const base64Data = f.split(',')[1];
      const fileSize = Buffer.byteLength(base64Data, 'base64');
      if (fileSize > 2 * 1024 * 1024) { // 2MB
        return res.status(400).json({
          success: false,
          error: {
            message: 'حجم فایل نباید بیشتر از ۲ مگابایت باشد',
            code: 'FILE_TOO_LARGE'
          }
        });
      }
      // Generate unique filename
      const filename = `${uuidv4()}.jpg`;
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      // Save file
      await writeFile(filePath, Buffer.from(base64Data, 'base64'));
      createdFilePaths.push(filePath);
      // Create gallery item
      const item = await prisma.galleryItem.create({
        data: {
          title,
          description,
          imageUrl: `/uploads/${filename}`,
          uploaderId: session.user.id,
          category
        }
      });
      createdItems.push(item);
    }
    if (createdItems.length > 0) {
      return res.status(201).json({
        success: true,
        data: createdItems
      });
    }
    // Backward compatibility: single file
    if (!file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'BAD_REQUEST'
        }
      });
    }

    if (typeof file === 'string' && (file.startsWith('http://') || file.startsWith('https://'))) {
      const item = await prisma.galleryItem.create({
        data: {
          title,
          description,
          imageUrl: file,
          uploaderId: session.user.id,
          category
        }
      });
      return res.status(201).json({
        success: true,
        data: item
      });
    }

    // Validate file type and size (base64)
    const matches = /^data:(image\/jpeg|image\/png);base64,/.exec(file);
    if (!matches) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'فرمت فایل فقط باید JPG یا PNG باشد',
          code: 'INVALID_FILE_TYPE'
        }
      });
    }
    // Calculate file size in bytes
    const base64Data = file.split(',')[1];
    const fileSize = Buffer.byteLength(base64Data, 'base64');
    if (fileSize > 2 * 1024 * 1024) { // 2MB
      return res.status(400).json({
        success: false,
        error: {
          message: 'حجم فایل نباید بیشتر از ۲ مگابایت باشد',
          code: 'FILE_TOO_LARGE'
        }
      });
    }

    // Generate unique filename
    const filename = `${uuidv4()}.jpg`;
    const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

    // Save file
    await writeFile(filePath, Buffer.from(file.split(',')[1], 'base64'));
    createdFilePaths.push(filePath);

    // Create gallery item
    const item = await prisma.galleryItem.create({
      data: {
        title,
        description,
        imageUrl: `/uploads/${filename}`,
        uploaderId: session.user.id,
        category
      }
    });

    return res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    // پاکسازی فایل‌های ایجادشده در صورت خطا
    for (const filePath of createdFilePaths) {
      try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch {}
    }
    logger.error('Error uploading gallery item', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error uploading gallery item',
        code: 'INTERNAL_SERVER_ERROR'
      }
    });
  }
};

export default handler; 