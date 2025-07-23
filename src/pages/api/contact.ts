import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const contactSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل 2 کاراکتر باشد').max(100, 'نام نمی‌تواند بیشتر از 100 کاراکتر باشد'),
  email: z.string().email('ایمیل نامعتبر است'),
  subject: z.string().min(5, 'موضوع باید حداقل 5 کاراکتر باشد').max(200, 'موضوع نمی‌تواند بیشتر از 200 کاراکتر باشد'),
  message: z.string().min(10, 'پیام باید حداقل 10 کاراکتر باشد').max(2000, 'پیام نمی‌تواند بیشتر از 2000 کاراکتر باشد'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' }
    });
  }

  try {
    const validatedData = contactSchema.parse(req.body);

    // Save contact message to database
    const contactMessage = await prisma.contact.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        status: 'PENDING'
      }
    });

    return res.status(201).json({
      success: true,
      data: {
        id: contactMessage.id,
        message: 'پیام شما با موفقیت ارسال شد'
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'داده‌های نامعتبر',
          code: 'VALIDATION_ERROR',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      });
    }

    console.error('Contact form error:', error);
    return res.status(500).json({
      success: false,
      error: { message: 'خطا در ارسال پیام', code: 'INTERNAL_SERVER_ERROR' }
    });
  }
} 