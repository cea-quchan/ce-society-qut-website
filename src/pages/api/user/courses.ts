import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/api";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { ErrorCode } from "@/types/errors";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
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
    case "GET":
      try {
        const { page = "1", limit = "10" } = req.query;
        const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

        const [courses, total] = await Promise.all([
          prisma.course.findMany({
            where: {
              // Use a valid relation for user courses
            },
            include: {
              instructor: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
              lessons: {
                select: {
                  id: true,
                  title: true,
                  duration: true,
                },
              },
            },
            skip,
            take: parseInt(limit as string),
            orderBy: {
              createdAt: "desc",
            },
          }),
          prisma.course.count({
            where: {
              // Use a valid relation for user courses
            },
          }),
        ]);

        return res.status(200).json({
          success: true,
          data: courses
        });
      } catch (error) {
        console.error("Error fetching user courses:", error);
        return res.status(500).json({
          success: false,
          error: {
            code: ErrorCode.INTERNAL_SERVER_ERROR,
            message: "Failed to fetch courses",
          },
        });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({
        success: false,
        error: {
          code: ErrorCode.METHOD_NOT_ALLOWED,
          message: `Method ${req.method} Not Allowed`,
        },
      });
  }
} 