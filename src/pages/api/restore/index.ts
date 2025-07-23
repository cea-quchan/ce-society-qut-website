import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ErrorCode } from "@/types/errors";
import { logger } from '@/lib/logger';
import { withAuth } from '@/middleware/auth';
import { withRateLimit } from '@/middleware/rateLimit';
import { withSecurity } from '@/middleware/security';
import { z } from 'zod';
import { exec } from 'child_process';
import { promisify } from 'util';
import { join } from 'path';

const execAsync = promisify(exec);

const restoreSchema = z.object({
  backupId: z.string().min(1, 'شناسه پشتیبان الزامی است'),
  confirm: z.boolean().refine(val => val === true, {
    message: 'لطفاً تأیید کنید که می‌خواهید پشتیبان را بازیابی کنید'
  })
});

type Handler = (req: NextApiRequest, res: NextApiResponse<ApiResponse<any>>, user?: any) => Promise<void>;

const handler: Handler = async (req, res, user) => {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({
      success: false,
      error: {
        code: ErrorCode.UNAUTHORIZED,
        message: "Unauthorized",
      },
    });
  }

  switch (req.method) {
    case "POST":
      try {
        const { backupId } = req.body;

        if (!backupId) {
          return res.status(400).json({
            success: false,
            error: {
              code: ErrorCode.INVALID_REQUEST,
              message: "Backup ID is required",
            },
          });
        }

        const backup = await prisma.backup.findUnique({
          where: { id: backupId },
        });

        if (!backup) {
          return res.status(404).json({
            success: false,
            error: {
              code: ErrorCode.NOT_FOUND,
              message: "Backup not found",
            },
          });
        }

        const restore = await prisma.restore.create({
          data: {
            backupId,
            startedBy: session.user.id,
            status: "pending",
          },
        });

        return res.status(200).json({
          success: true,
          data: { restoreId: restore.id }
        });
      } catch (error) {
        console.error("Error creating restore:", error);
        return res.status(500).json({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: "Failed to create restore",
          },
        });
      }

    case "GET":
      try {
        const { id } = req.query;

        if (id) {
          const restore = await prisma.restore.findUnique({
            where: { id: id as string },
            include: {
              backup: true,
              user: true,
            },
          });

          if (!restore) {
            return res.status(404).json({
              success: false,
              error: {
                code: ErrorCode.NOT_FOUND,
                message: "Restore not found",
              },
            });
          }

          return res.status(200).json({
            success: true,
            data: restore
          });
        }

        const restores = await prisma.restore.findMany({
          where: {
            startedBy: session.user.id,
          },
          include: {
            backup: true,
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        return res.status(200).json({
          success: true,
          data: restores
        });
      } catch (error) {
        console.error("Error fetching restores:", error);
        return res.status(500).json({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: "Failed to fetch restores",
          },
        });
      }

    default:
      res.setHeader("Allow", ["POST", "GET"]);
      return res.status(405).json({
        success: false,
        error: {
          code: ErrorCode.METHOD_NOT_ALLOWED,
          message: `Method ${req.method} Not Allowed`,
        },
      });
  }
};

// Apply middleware with rate limiting
export default withSecurity(
  withRateLimit(
    withAuth(handler),
    { windowMs: 15 * 60 * 1000, max: 100 } // 15 minutes, 100 requests
  )
); 