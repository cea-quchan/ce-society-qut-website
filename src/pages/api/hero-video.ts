import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const heroVideo = await prisma.heroVideo.findFirst();
    return res.status(200).json({ success: true, data: heroVideo });
  }
  res.setHeader('Allow', ['GET']);
  return res.status(405).json({ success: false, error: { message: 'Method Not Allowed', code: 'METHOD_NOT_ALLOWED' } });
}
