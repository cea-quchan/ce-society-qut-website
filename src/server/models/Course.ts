import { prisma } from "@/lib/prisma";

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  instructorId: string;
  published?: boolean;
  startDate: Date;
  endDate: Date;
  capacity: number;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  published?: boolean;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
}

export class CourseModel {
  static async create(data: CreateCourseData) {
    return prisma.course.create({
      data: {
        ...data,
        enrolled: 0
      }
    });
  }

  static async findById(id: string) {
    return prisma.course.findUnique({
      where: { id },
      include: {
        instructor: true
      }
    });
  }

  static async update(id: string, data: UpdateCourseData) {
    return prisma.course.update({
      where: { id },
      data
    });
  }

  static async delete(id: string) {
    return prisma.course.delete({
      where: { id }
    });
  }

  static async list() {
    return prisma.course.findMany({
      include: {
        instructor: true
      }
    });
  }

  static async findByInstructor(instructorId: string) {
    return prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: true
      }
    });
  }
} 