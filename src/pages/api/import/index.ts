import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { logger } from '@/lib/logger';
import { ApiResponse, ErrorCode } from '@/types/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { promises as fs } from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

interface ImportResult {
  count: number;
  type: string;
}

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  if (req.method !== 'POST') {
    logger.warn(`Method ${req.method} not allowed`, req);
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      error: {
        message: `Method ${req.method} Not Allowed`,
        code: 'METHOD_NOT_ALLOWED' as ErrorCode
      }
    });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    logger.warn('Unauthorized import attempt', req);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Unauthorized',
        code: 'UNAUTHORIZED' as ErrorCode
      }
    });
  }

  try {
    const { type, file } = req.body;

    if (!type || !file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'BAD_REQUEST' as ErrorCode
        }
      });
    }

    const filePath = path.join(process.cwd(), 'uploads', file);
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });

    let result;
    switch (type) {
      case 'users':
        result = await prisma.user.createMany({
          data: records.map((record: any) => ({
            email: record.email,
            name: record.name,
            role: record.role || 'USER'
          })),
          skipDuplicates: true
        });
        break;

      case 'courses':
        result = await prisma.course.createMany({
          data: records.map((record: any) => ({
            title: record.title,
            description: record.description,
            instructorId: record.instructorId,
            startDate: new Date(record.startDate),
            endDate: new Date(record.endDate),
            capacity: parseInt(record.capacity)
          })),
          skipDuplicates: true
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: {
            message: 'Invalid import type',
            code: 'BAD_REQUEST' as ErrorCode
          }
        });
    }

    // Delete the uploaded file
    await fs.unlink(filePath);

    const importResult: ImportResult = {
      count: result.count,
      type
    };

    const response: ApiResponse<ImportResult> = {
      success: true,
      data: importResult
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error('Error importing data', error, req);
    return res.status(500).json({
      success: false,
      error: {
        message: 'Error importing data',
        code: 'INTERNAL_SERVER_ERROR' as ErrorCode
      }
    });
  }
};

export default handler; 