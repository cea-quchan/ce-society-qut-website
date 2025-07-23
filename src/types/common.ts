import { NextApiRequest, NextApiResponse } from 'next';
import { User } from '@prisma/client';
import { ApiResponse as BaseApiResponse, ApiError } from './api';

export interface AuthenticatedRequest extends NextApiRequest {
  user: User;
}

export type ApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  user?: User
) => Promise<void>;

export interface ValidationError {
  message: string;
  field?: string;
  code?: string;
  details?: unknown;
}

export type { BaseApiResponse as ApiResponse };

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedData<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterParams {
  search?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  [key: string]: string | number | boolean | undefined;
} 