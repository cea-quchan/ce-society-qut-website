import { Request } from 'express';
import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: User;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SearchQuery {
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface FilterQuery {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
} 