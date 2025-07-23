import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
  }
  const session = await getServerSession(req, res, authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return res.status(401).json({ success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } });
  }
  const { order } = req.body;
  if (!Array.isArray(order)) {
    return res.status(400).json({ success: false, error: { message: 'Invalid order payload', code: 'BAD_REQUEST' } });
  }
  try {
    for (const { id, order: ord } of order) {
      await prisma.galleryItem.update({ where: { id }, data: { order: ord } });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: { message: 'Error updating order', code: 'INTERNAL_SERVER_ERROR' } });
  }
} 