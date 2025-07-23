import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from "@/lib/prisma";
import { ApiResponse, ErrorCode } from '@/types/api';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'GET':
      try {
        const members = await prisma.member.findMany({
          orderBy: {
            createdAt: 'desc'
          }
        });
        res.status(200).json({
          success: true,
          data: members
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: {
            message: 'خطا در دریافت اعضا',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    case 'POST':
      try {
        const member = await prisma.member.create({
          data: req.body
        });
        res.status(201).json({
          success: true,
          data: member
        });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: {
            message: 'خطا در ثبت عضویت',
            code: 'INTERNAL_SERVER_ERROR'
          }
        });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 