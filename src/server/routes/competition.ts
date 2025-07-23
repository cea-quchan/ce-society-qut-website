import { Router, Request, Response, NextFunction } from 'express';
import { CompetitionModel } from '../models/Competition';
import { CreateCompetitionData } from '../models/Competition';

const router = Router();

const ensureAuthenticated = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  next();
};

router.post('/', ensureAuthenticated, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startDate, endDate, organizerId, rules, prize, maxParticipants, location } = req.body;
    const competition = await CompetitionModel.create({
      title,
      description,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'UPCOMING',
      organizerId,
      rules,
      prize,
      maxParticipants,
      location
    });

    res.status(201).json(competition);
  } catch (error) {
    console.error('Competition creation error:', error);
    res.status(500).json({ message: 'خطا در ایجاد مسابقه' });
  }
});

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const competitions = await CompetitionModel.list();
    res.json(competitions);
  } catch (error) {
    console.error('Competition list error:', error);
    res.status(500).json({ message: 'خطا در دریافت لیست مسابقات' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const competition = await CompetitionModel.findById(req.params.id);
    if (!competition) {
      res.status(404).json({ message: 'مسابقه یافت نشد' });
      return;
    }
    res.json(competition);
  } catch (error) {
    console.error('Competition fetch error:', error);
    res.status(500).json({ message: 'خطا در دریافت مسابقه' });
  }
});

router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, startDate, endDate, status } = req.body;
    const competition = await CompetitionModel.update(req.params.id, {
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status
    });
    res.json(competition);
  } catch (error) {
    console.error('Competition update error:', error);
    res.status(500).json({ message: 'خطا در بروزرسانی مسابقه' });
  }
});

router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    await CompetitionModel.delete(req.params.id);
    res.status(204).end();
  } catch (error) {
    console.error('Competition deletion error:', error);
    res.status(500).json({ message: 'خطا در حذف مسابقه' });
  }
});

export default router; 