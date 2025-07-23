import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { ApiResponse } from './api';

declare global {
  namespace NodeJS {
    interface Global {
      withValidation: (schema: z.ZodSchema) => (
        req: NextApiRequest,
        res: NextApiResponse<ApiResponse>,
        next: () => void
      ) => Promise<void>;
      withLogger: (
        req: NextApiRequest,
        res: NextApiResponse<ApiResponse>,
        next: () => void
      ) => Promise<void>;
    }
  }
} 