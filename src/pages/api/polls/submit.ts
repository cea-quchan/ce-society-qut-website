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
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({
      success: false,
      error: {
        code: ErrorCode.METHOD_NOT_ALLOWED,
        message: `Method ${req.method} Not Allowed`,
      },
    });
  }

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

  try {
    const { pollId, optionId } = req.body;

    if (!pollId || !optionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: "Poll ID and option ID are required",
        },
      });
    }

    const poll = await prisma.poll.findUnique({
      where: { id: pollId },
      include: {
        options: true,
      },
    });

    if (!poll) {
      return res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "Poll not found",
        },
      });
    }

    if (poll.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.INVALID_REQUEST,
          message: "Poll is not active",
        },
      });
    }

    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      return res.status(404).json({
        success: false,
        error: {
          code: ErrorCode.NOT_FOUND,
          message: "Option not found",
        },
      });
    }

    const existingVote = await prisma.pollVote.findFirst({
      where: {
        pollId,
        userId: session.user.id,
      },
    });

    if (existingVote) {
      return res.status(400).json({
        success: false,
        error: {
          code: ErrorCode.CONFLICT,
          message: "You have already voted in this poll",
        },
      });
    }

    const vote = await prisma.pollVote.create({
      data: {
        pollId,
        optionId,
        userId: session.user.id,
      },
    });

    return res.status(200).json({
      success: true,
      data: vote
    });
  } catch (error) {
    console.error("Error submitting poll vote:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Failed to submit vote",
      },
    });
  }
} 