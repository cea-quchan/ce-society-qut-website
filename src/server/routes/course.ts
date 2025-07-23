import { Router, Request, Response, NextFunction } from 'express';
import { CourseModel } from '../models/Course';
import { AuthenticatedRequest } from '@/types/express';
import { CreateCourseData } from '../models/Course';

const router = Router();

// اضافه کردن middleware احراز هویت
const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  next();
};

router.post('/', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price, startDate, endDate, capacity } = req.body;
    const course = await CourseModel.create({
      title,
      description,
      price,
      instructorId: req.user!.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      capacity
    });

    res.status(201).json(course);
  } catch (error) {
    console.error('Course creation error:', error);
    res.status(500).json({ message: 'Error creating course' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const courses = await CourseModel.list();
    res.json(courses);
  } catch (error) {
    console.error('Course list error:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست دوره‌ها' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const course = await CourseModel.findById(req.params.id);
    if (!course) {
      res.status(404).json({ message: 'دوره یافت نشد' });
      return;
    }
    res.json(course);
  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({ message: 'خطا در دریافت دوره' });
  }
});

router.put('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, price } = req.body;
    const course = await CourseModel.update(req.params.id, {
      title,
      description,
      price
    });
    res.json(course);
  } catch (error) {
    console.error('Course update error:', error);
    res.status(500).json({ message: 'خطا در بروزرسانی دوره' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    await CourseModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Course deletion error:', error);
    res.status(500).json({ message: 'خطا در حذف دوره' });
  }
});

export default router; 