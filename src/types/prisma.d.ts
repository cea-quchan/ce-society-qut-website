import { Prisma, User } from '@prisma/client';

export type PaginationQuery = {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
};

export type UserWhere = Prisma.UserWhereInput;
export type UserOrderBy = Prisma.UserOrderByWithRelationInput;
export type UserSelect = Prisma.UserSelect;
export type UserInclude = Prisma.UserInclude;

export type UsersResponse = {
  success: boolean;
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}; 