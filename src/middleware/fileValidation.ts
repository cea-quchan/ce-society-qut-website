import type { NextApiRequest, NextApiResponse } from 'next';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import formidable from 'formidable';
import { createHash } from 'crypto';

interface FileValidationConfig {
  maxSize: number;
  allowedTypes: string[];
  maxFiles: number;
}

const defaultConfig: FileValidationConfig = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxFiles: 5
};

export const withFileValidation = (handler: ApiHandler, config: FileValidationConfig = defaultConfig) => {
  return async (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>) => {
    try {
      if (!req.files) {
        return handler(req, res);
      }

      const files = Array.isArray(req.files) ? req.files : [req.files];

      if (files.length > config.maxFiles) {
        logger.warn(`Too many files uploaded: ${files.length}`, req);
        return res.status(400).json({
          success: false,
          error: {
            message: 'تعداد فایل‌ها بیش از حد مجاز است',
            code: 'VALIDATION_ERROR'
          }
        });
      }

      for (const file of files) {
        if (file.size > config.maxSize) {
          logger.warn(`File size exceeds limit: ${file.size} bytes`, req);
          return res.status(400).json({
            success: false,
            error: {
              message: 'حجم فایل بیش از حد مجاز است',
              code: 'VALIDATION_ERROR'
            }
          });
        }

        if (!config.allowedTypes.includes(file.mimetype)) {
          logger.warn(`Invalid file type: ${file.mimetype}`, req);
          return res.status(400).json({
            success: false,
            error: {
              message: 'نوع فایل مجاز نیست',
              code: 'VALIDATION_ERROR'
            }
          });
        }
      }

      return handler(req, res);
    } catch (error) {
      logger.error('File validation middleware error', error, req);
      return res.status(500).json({
        success: false,
        error: {
          message: 'خطا در بررسی فایل',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
}; 