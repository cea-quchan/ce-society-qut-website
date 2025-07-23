import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ApiHandler } from '@/types/common';
import { logger } from './logger';

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Event Schema
export const EventSchema = z.object({
  title: z.string().min(1, 'عنوان رویداد الزامی است'),
  description: z.string().min(1, 'توضیحات رویداد الزامی است'),
  date: z.string().min(1, 'تاریخ رویداد الزامی است'),
  time: z.string().min(1, 'زمان رویداد الزامی است'),
  location: z.string().min(1, 'مکان رویداد الزامی است'),
  type: z.string().min(1, 'نوع رویداد الزامی است'),
  capacity: z.number().int().positive('ظرفیت رویداد الزامی است')
});

// News Schema
export const NewsSchema = z.object({
  title: z.string().min(1, 'عنوان خبر الزامی است'),
  content: z.string().min(1, 'محتوی خبر الزامی است'),
  author: z.string().min(1, 'نویسنده خبر الزامی است'),
  category: z.string().min(1, 'دسته‌بندی خبر الزامی است')
});

// Member Schema
export const MemberSchema = z.object({
  name: z.string().min(1, 'نام و نام خانوادگی الزامی است'),
  studentId: z.string().min(1, 'شماره دانشجویی الزامی است'),
  email: z.string().email('ایمیل نامعتبر است'),
  phone: z.string().min(1, 'شماره تماس الزامی است'),
  major: z.string().min(1, 'رشته تحصیلی الزامی است'),
  year: z.string().min(1, 'مقطع تحصیلی الزامی است')
});

// FAQ Schema
export const FAQSchema = z.object({
  question: z.string().min(1, 'سوال الزامی است'),
  answer: z.string().min(1, 'پاسخ الزامی است'),
  category: z.string().min(1, 'دسته‌بندی الزامی است')
});

// Notification Schema
export const NotificationSchema = z.object({
  title: z.string().min(1, 'عنوان اعلان الزامی است'),
  message: z.string().min(1, 'متن اعلان الزامی است'),
  type: z.string().min(1, 'نوع اعلان الزامی است'),
  role: z.string().optional(),
  userId: z.string().optional()
}).refine(data => data.role || data.userId, {
  message: 'گیرنده اعلان الزامی است'
});

// Comment Schema
export const CommentSchema = z.object({
  content: z.string().min(1, 'متن نظر الزامی است'),
  postId: z.string().min(1, 'شناسه پست الزامی است'),
  postType: z.string().min(1, 'نوع پست الزامی است'),
  file: z.object({
    size: z.number().max(5 * 1024 * 1024, 'حجم فایل نباید بیشتر از 5 مگابایت باشد'),
    type: z.string().refine(
      type => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type),
      'نوع فایل مجاز نیست'
    )
  }).optional()
});

// Message Schema
export const MessageSchema = z.object({
  content: z.string().min(1, 'متن پیام الزامی است'),
  receiverId: z.string().min(1, 'گیرنده پیام الزامی است'),
  file: z.object({
    size: z.number().max(5 * 1024 * 1024, 'حجم فایل نباید بیشتر از 5 مگابایت باشد'),
    type: z.string().refine(
      type => ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'].includes(type),
      'نوع فایل مجاز نیست'
    )
  }).optional()
});

// Like Schema
export const LikeSchema = z.object({
  postId: z.string().min(1, 'شناسه پست الزامی است'),
  postType: z.string().min(1, 'نوع پست الزامی است')
});

// Validation middleware
export const withValidation = <T extends z.ZodType>(
  handler: ApiHandler,
  schema: T
) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const result = schema.safeParse(req.body);
      
      if (!result.success) {
        logger.warn('Validation error', { errors: result.error.errors }, req);
        return res.status(400).json({
          success: false,
          error: {
            message: 'داده‌های نامعتبر',
            code: 'VALIDATION_ERROR',
            details: result.error.errors
          }
        });
      }

      return handler(req, res);
    } catch (error) {
      logger.error('Validation middleware error', error, req);
      return res.status(500).json({ 
        success: false,
        error: {
          message: 'خطا در اعتبارسنجی داده‌ها',
          code: 'INTERNAL_SERVER_ERROR'
        }
      });
    }
  };
}; 