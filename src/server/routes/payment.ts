import { Router, Request, Response } from 'express';
import { prisma } from "@/lib/prisma";

const router = Router();

router.post('/verify', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, message: "ابتدا باید وارد شوید" });
  }
  const { token, amount } = req.body;

  // در اینجا باید منطق تایید پرداخت با درگاه پرداخت پیاده‌سازی شود
  // این یک نمونه ساده است

  prisma.payment.create({
    data: {
      amount,
      status: 'SUCCESS',
      userId: user.id, // نیاز به middleware برای احراز هویت
      type: 'COURSE_PURCHASE'
    }
  }).then(payment => {
    res.json({ success: true, payment });
  }).catch(error => {
    console.error('Payment verification error:', error);
    res.status(500).json({ success: false, message: 'خطا در تایید پرداخت' });
  });
});

router.get('/history', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ success: false, message: "ابتدا باید وارد شوید" });
  }
  prisma.payment.findMany({
    where: {
      userId: user.id // نیاز به middleware برای احراز هویت
    },
    orderBy: {
      createdAt: 'desc'
    }
  }).then(payments => {
    res.json({ success: true, payments });
  }).catch(error => {
    console.error('Payment history error:', error);
    res.status(500).json({ success: false, message: 'خطا در دریافت تاریخچه پرداخت‌ها' });
  });
});

export default router; 