import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { Course } from '@/types/api';
import { z } from 'zod';

// Add zod schema for course creation
const courseSchema = z.object({
  title: z.string().min(3, 'عنوان باید حداقل ۳ کاراکتر باشد'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  startDate: z.string().datetime('تاریخ شروع نامعتبر است'),
  endDate: z.string().datetime('تاریخ پایان نامعتبر است'),
  capacity: z.number().int().positive('ظرفیت باید عدد مثبت باشد'),
  price: z.number().positive('قیمت باید عدد مثبت باشد'),
  instructorId: z.string().min(1, 'شناسه مدرس الزامی است'),
});

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'GET') {
    try {
      const { page = '1', limit = '10', search, category } = req.query;
      const pageNumber = parseInt(page as string);
      const limitNumber = parseInt(limit as string);

      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (search) {
        where.OR = [
          { title: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } }
        ];
      }

      const [courses, total] = await Promise.all([
        prisma.course.findMany({
          where,
          skip: (pageNumber - 1) * limitNumber,
          take: limitNumber,
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            lessons: {
              select: {
                id: true,
                title: true,
                order: true
              }
            }
          }
        }),
        prisma.course.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNumber);

      const response = {
        success: true,
        data: {
          items: courses.map(course => ({
            id: course.id,
            title: course.title,
            description: course.description,
            instructor: course.instructor,
            lessons: course.lessons,
            price: course.price,
            createdAt: course.createdAt,
            updatedAt: course.updatedAt
          })) as Course[],
          pagination: {
            total,
            currentPage: pageNumber,
            limit: limitNumber,
            totalPages
          }
        }
      };

      return res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطای سرور', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else if (req.method === 'POST') {
    try {
      // اعتبارسنجی ورودی با zod
      const validation = courseSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'داده‌های نامعتبر',
            code: 'VALIDATION_ERROR',
            details: validation.error.errors
          }
        });
      }
      const { title, description, startDate, endDate, capacity, price, instructorId } = validation.data;
      const newCourse = await prisma.course.create({
        data: {
          title,
          description,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          capacity,
          price,
          instructor: { connect: { id: instructorId } }
        },
        include: {
          instructor: true,
          lessons: true
        }
      });
      return res.status(201).json({
        success: true,
        data: newCourse
      });
    } catch (error) {
      console.error('Error creating course:', error);
      return res.status(500).json({
        success: false,
        error: { message: 'خطا در ایجاد دوره', code: 'INTERNAL_SERVER_ERROR' }
      });
    }
  } else {
    return res.status(405).json({
      success: false,
      error: { message: `Method ${req.method} Not Allowed`, code: 'METHOD_NOT_ALLOWED' }
    });
  }
};

export default handler; 