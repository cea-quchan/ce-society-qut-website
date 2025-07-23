import { prisma } from "@/lib/prisma";

export interface CreateArticleData {
  title: string;
  content: string;
  authorId: string;
  published: boolean;
}

export interface UpdateArticleData {
  title?: string;
  content?: string;
  published?: boolean;
}

export class ArticleModel {
  static async create(data: CreateArticleData) {
    return prisma.article.create({
      data: {
        ...data,
        published: data.published ?? false
      },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        },
        likes: true
      }
    });
  }

  static async findById(id: string) {
    return prisma.article.findUnique({
      where: { id },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        },
        likes: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async update(id: string, data: UpdateArticleData) {
    return prisma.article.update({
      where: { id },
      data,
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        },
        likes: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async delete(id: string) {
    return prisma.article.delete({
      where: { id }
    });
  }

  static async list() {
    return prisma.article.findMany({
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        },
        likes: {
          include: {
            user: true
          }
        }
      }
    });
  }

  static async findByAuthor(authorId: string) {
    return prisma.article.findMany({
      where: { authorId },
      include: {
        author: true,
        comments: {
          include: {
            author: true
          }
        },
        likes: {
          include: {
            user: true
          }
        }
      }
    });
  }
} 