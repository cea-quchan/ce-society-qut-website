import { Router, Request, Response, NextFunction } from 'express';
import { ArticleModel } from '../models/Article';
import { CreateArticleData } from '../models/Article';

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
    const { title, content } = req.body;
    const article = await ArticleModel.create({
      title,
      content,
      authorId: req.user!.id,
      published: true
    });

    res.status(201).json(article);
  } catch (error) {
    console.error('Article creation error:', error);
    res.status(500).json({ message: 'Error creating article' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const articles = await ArticleModel.list();
    res.json(articles);
  } catch (error) {
    console.error('Article list error:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست مقالات' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await ArticleModel.findById(req.params.id);
    if (!article) {
      res.status(404).json({ message: 'مقاله یافت نشد' });
      return;
    }
    res.json(article);
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ message: 'خطا در دریافت مقاله' });
  }
});

router.put('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    const article = await ArticleModel.update(req.params.id, {
      title,
      content
    });
    res.json(article);
  } catch (error) {
    console.error('Article update error:', error);
    res.status(500).json({ message: 'خطا در بروزرسانی مقاله' });
  }
});

router.delete('/:id', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    await ArticleModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Article deletion error:', error);
    res.status(500).json({ message: 'خطا در حذف مقاله' });
  }
});

export default router; 