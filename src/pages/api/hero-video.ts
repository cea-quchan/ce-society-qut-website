import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    // Return all hero videos, ordered
    const heroVideos = await prisma.heroVideo.findMany({ orderBy: { order: 'asc' } });
    return res.status(200).json({ success: true, data: heroVideos });
  }

  if (req.method === 'POST') {
    try {
      const { videoUrl, description, platform, order } = req.body;
      if (!videoUrl || !platform) {
        return res.status(400).json({ success: false, error: { message: 'لینک ویدیو و پلتفرم الزامی است', code: 'VALIDATION_ERROR' } });
      }
      const heroVideo = await prisma.heroVideo.create({
        data: { videoUrl, description, platform, order: order ?? 0 }
      });
      return res.status(200).json({ success: true, data: heroVideo });
    } catch (error) {
      return res.status(500).json({ success: false, error: { message: 'خطا در ایجاد ویدیو', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { id, videoUrl, description, platform, order } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: { message: 'شناسه ویدیو الزامی است', code: 'VALIDATION_ERROR' } });
      }
      const heroVideo = await prisma.heroVideo.update({
        where: { id },
        data: { videoUrl, description, platform, order }
      });
      return res.status(200).json({ success: true, data: heroVideo });
    } catch (error) {
      return res.status(500).json({ success: false, error: { message: 'خطا در ویرایش ویدیو', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ success: false, error: { message: 'شناسه ویدیو الزامی است', code: 'VALIDATION_ERROR' } });
      }
      await prisma.heroVideo.delete({ where: { id } });
      return res.status(200).json({ success: true, message: 'ویدیو با موفقیت حذف شد' });
    } catch (error) {
      return res.status(500).json({ success: false, error: { message: 'خطا در حذف ویدیو', code: 'INTERNAL_SERVER_ERROR' } });
    }
  }

  res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
  return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
} 