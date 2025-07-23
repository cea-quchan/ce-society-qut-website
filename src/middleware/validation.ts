import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors';
import type { ApiResponse, ApiHandler } from '@/types/api';
import { logger } from '@/lib/logger';
import { AppError } from '@/middleware/error';

// Base validation schema
const baseSchema = z.object({
  id: z.string().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
});

// User validation schema
export const userSchema = baseSchema.extend({
  name: z.string()
    .min(2, 'نام باید حداقل 2 کاراکتر باشد')
    .max(50, 'نام نمی‌تواند بیشتر از 50 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  password: z.string()
    .min(8, 'رمز عبور باید حداقل 8 کاراکتر باشد')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'رمز عبور باید شامل حروف بزرگ، کوچک و اعداد باشد'),
  role: z.enum(['USER', 'ADMIN']).default('USER'),
  image: z.string().url('آدرس تصویر نامعتبر است').optional()
});

// Post validation schema
export const postSchema = baseSchema.extend({
  title: z.string()
    .min(3, 'عنوان باید حداقل 3 کاراکتر باشد')
    .max(100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  content: z.string()
    .min(10, 'محتوا باید حداقل 10 کاراکتر باشد')
    .max(5000, 'محتوا نمی‌تواند بیشتر از 5000 کاراکتر باشد'),
  authorId: z.string(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).optional()
});

// Comment validation schema
export const commentSchema = baseSchema.extend({
  content: z.string()
    .min(2, 'نظر باید حداقل 2 کاراکتر باشد')
    .max(500, 'نظر نمی‌تواند بیشتر از 500 کاراکتر باشد'),
  authorId: z.string(),
  postId: z.string()
});

// Event validation schema
export const eventSchema = baseSchema.extend({
  title: z.string()
    .min(3, 'عنوان باید حداقل 3 کاراکتر باشد')
    .max(100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  description: z.string()
    .min(10, 'توضیحات باید حداقل 10 کاراکتر باشد')
    .max(2000, 'توضیحات نمی‌تواند بیشتر از 2000 کاراکتر باشد'),
  startDate: z.date(),
  endDate: z.date(),
  location: z.string(),
  organizerId: z.string(),
  capacity: z.number().min(1, 'ظرفیت باید حداقل 1 نفر باشد'),
  price: z.number().min(0, 'قیمت نمی‌تواند منفی باشد').optional()
});

// News validation schema
export const newsSchema = baseSchema.extend({
  title: z.string()
    .min(3, 'عنوان باید حداقل 3 کاراکتر باشد')
    .max(100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  content: z.string()
    .min(10, 'محتوا باید حداقل 10 کاراکتر باشد')
    .max(5000, 'محتوا نمی‌تواند بیشتر از 5000 کاراکتر باشد'),
  authorId: z.string(),
  image: z.string().url('آدرس تصویر نامعتبر است').optional(),
  published: z.boolean().default(false)
});

// Message validation schema
export const messageSchema = baseSchema.extend({
  content: z.string()
    .min(1, 'پیام نمی‌تواند خالی باشد')
    .max(1000, 'پیام نمی‌تواند بیشتر از 1000 کاراکتر باشد'),
  senderId: z.string(),
  receiverId: z.string(),
  read: z.boolean().default(false)
});

// Notification validation schema
export const notificationSchema = baseSchema.extend({
  title: z.string()
    .min(2, 'عنوان باید حداقل 2 کاراکتر باشد')
    .max(100, 'عنوان نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  message: z.string()
    .min(2, 'پیام باید حداقل 2 کاراکتر باشد')
    .max(500, 'پیام نمی‌تواند بیشتر از 500 کاراکتر باشد'),
  userId: z.string(),
  read: z.boolean().default(false),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS'])
});

export type ValidationSchema<T> = z.ZodType<T>;

export const withValidation = <T>(
  schema: ValidationSchema<T>,
  handler: ApiHandler<T>
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
  ) => {
    try {
      const validatedData = await schema.parseAsync(req.body);
      return handler(req, res, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Validation failed', {
          path: req.url,
          method: req.method,
          errors: error.errors
        });

        throw new ValidationError('داده‌های ارسالی نامعتبر هستند', {
          errors: error.errors
        });
      }
      throw error;
    }
  };
};

export const validateQuery = <T>(
  schema: ValidationSchema<T>,
  handler: ApiHandler<T>
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
  ) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      return handler(req, res, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Query validation failed', {
          path: req.url,
          method: req.method,
          errors: error.errors
        });

        throw new ValidationError('پارامترهای ارسالی نامعتبر هستند', {
          errors: error.errors
        });
      }
      throw error;
    }
  };
};

export const validateParams = <T>(
  schema: ValidationSchema<T>,
  handler: ApiHandler<T>
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<ApiResponse<T>>
  ) => {
    try {
      const validatedData = await schema.parseAsync(req.query);
      return handler(req, res, validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn('Params validation failed', {
          path: req.url,
          method: req.method,
          errors: error.errors
        });

        throw new ValidationError('پارامترهای ارسالی نامعتبر هستند', {
          errors: error.errors
        });
      }
      throw error;
    }
  };
};

// Common validation schemas
export const paginationSchema = z.object({
  page: z.string().optional().transform(val => parseInt(val || '1')),
  limit: z.string().optional().transform(val => parseInt(val || '10')),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
  search: z.string().optional()
});

export const idSchema = z.object({
  id: z.string().uuid()
});

export const emailSchema = z.object({
  email: z.string().email('ایمیل نامعتبر است')
});

export const passwordSchema = z.object({
  password: z.string()
    .min(8, 'رمز عبور باید حداقل ۸ کاراکتر باشد')
    .regex(/[A-Z]/, 'رمز عبور باید شامل حرف بزرگ باشد')
    .regex(/[a-z]/, 'رمز عبور باید شامل حرف کوچک باشد')
    .regex(/[0-9]/, 'رمز عبور باید شامل عدد باشد')
    .regex(/[^A-Za-z0-9]/, 'رمز عبور باید شامل کاراکتر خاص باشد')
}); 