import type { NextApiRequest, NextApiResponse } from "next";
import type { ApiResponse } from "@/types/api";
import { getServerSession } from "next-auth";
import { authOptions } from "./auth/[...nextauth]";
import { ErrorCode } from "@/types/errors";
import { uploadToS3 } from "@/lib/s3";

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
    const files = req.files as any;
    if (!files || !files.file) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No file uploaded',
          code: 'BAD_REQUEST'
        }
      });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;

    const uploadPromises = [uploadToS3(file)];
    const results = await Promise.all(uploadPromises);

    return res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    return res.status(500).json({
      success: false,
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: "Failed to upload files",
      },
    });
  }
} 