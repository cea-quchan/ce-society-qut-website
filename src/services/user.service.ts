import { prisma } from "@/lib/prisma";
import { hash } from 'bcryptjs';
import type { User as PrismaUser } from '@prisma/client';
import { logger } from '@/lib/logger';
import { ValidationError } from '@/lib/errors';
import { normalizeRole } from '@/utils/roleMap';

export type Role = 'ADMIN' | 'USER'; // Add more roles as needed
export type User = PrismaUser;
export type SafeUser = Omit<PrismaUser, 'password'>;
export type PublicUser = Pick<PrismaUser, 'id' | 'name' | 'email' | 'role' | 'image' | 'createdAt' | 'updatedAt'>;

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: Role;
  image?: string;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  image?: string;
  role?: Role;
}

interface UserFilters {
  search?: string;
  role?: Role;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface UserPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class UserService {
  // Create a new user
  static async createUser(data: CreateUserData): Promise<SafeUser> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email }
      });

      if (existingUser) {
        throw new ValidationError('کاربری با این ایمیل قبلا ثبت نام کرده است', {
          errors: [{
            message: 'کاربری با این ایمیل قبلا ثبت نام کرده است',
            path: ['email'],
            code: 'custom'
          }]
        });
      }

      // Hash password
      const hashedPassword = await hash(data.password, 12);

      // Create user
      const user = await prisma.user.create({
        data: {
          ...data,
          role: normalizeRole(data.role ?? 'user'),
          password: hashedPassword,
          points: 0,
          emailVerified: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          points: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info(`User created successfully: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  // Get users with pagination and filters
  static async getUsers(filters: UserFilters): Promise<{ users: PublicUser[], pagination: UserPagination }> {
    try {
      const {
        search,
        role,
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc'
      } = filters;

      const skip = (page - 1) * limit;

      // Build where clause
      const where = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } }
          ]
        }),
        ...(role && { role })
      };

      // Get total count
      const total = await prisma.user.count({ where });

      // Get users
      const users = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: {
          [sort]: order
        },
        skip,
        take: limit
      });

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      logger.error('Error fetching users:', error);
      throw error;
    }
  }

  // Update user
  static async updateUser(id: string, data: UpdateUserData, currentUser: User): Promise<SafeUser> {
    try {
      // Check permissions
      if (id !== currentUser.id && currentUser.role !== 'ADMIN') {
        throw new ValidationError('شما دسترسی به ویرایش این کاربر را ندارید', {
          errors: [{
            message: 'شما دسترسی به ویرایش این کاربر را ندارید',
            path: ['id'],
            code: 'custom'
          }]
        });
      }

      // Check if email is being changed and if it already exists
      if (data.email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email: data.email,
            id: { not: id }
          }
        });

        if (existingUser) {
          throw new ValidationError('این ایمیل قبلاً ثبت شده است', {
            errors: [{
              message: 'این ایمیل قبلاً ثبت شده است',
              path: ['email'],
              code: 'custom'
            }]
          });
        }
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...data,
          role: data.role ? normalizeRole(data.role) : undefined
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          points: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true
        }
      });

      logger.info(`User updated successfully: ${user.id}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id: string, currentUser: User): Promise<void> {
    try {
      // Check permissions
      if (id !== currentUser.id && currentUser.role !== 'ADMIN') {
        throw new ValidationError('شما دسترسی به حذف این کاربر را ندارید', {
          errors: [{
            message: 'شما دسترسی به حذف این کاربر را ندارید',
            path: ['id'],
            code: 'custom'
          }]
        });
      }

      // Delete related data first
      await prisma.$transaction([
        prisma.like.deleteMany({ where: { userId: id } }),
        prisma.comment.deleteMany({ where: { authorId: id } }),
        prisma.article.deleteMany({ where: { authorId: id } }),
        prisma.event.deleteMany({ where: { organizerId: id } }),
        prisma.user.delete({ where: { id } })
      ]);

      logger.info(`User deleted successfully: ${id}`);
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }
} 