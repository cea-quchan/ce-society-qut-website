import { prisma } from "@/lib/prisma";
import bcrypt from 'bcryptjs';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
}

export class UserModel {
  static async create(data: CreateUserData) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword
      }
    });
  }

  static async findById(id: string) {
    return prisma.user.findUnique({
      where: { id }
    });
  }

  static async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    });
  }

  static async update(id: string, data: UpdateUserData) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.user.delete({
      where: { id }
    });
  }

  static async list() {
    return prisma.user.findMany();
  }
} 