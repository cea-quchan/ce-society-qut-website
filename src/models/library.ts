import { z } from 'zod';

export const LibraryCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const LibraryTagSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const LibraryResourceSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  content: z.string(),
  fileUrl: z.string().url(),
  authorId: z.string(),
  categoryId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const LibraryCommentSchema = z.object({
  id: z.string(),
  resourceId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateLibraryCategorySchema = LibraryCategorySchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreateLibraryTagSchema = LibraryTagSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreateLibraryResourceSchema = LibraryResourceSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreateLibraryCommentSchema = LibraryCommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type LibraryCategory = z.infer<typeof LibraryCategorySchema>;
export type LibraryTag = z.infer<typeof LibraryTagSchema>;
export type LibraryResource = z.infer<typeof LibraryResourceSchema>;
export type LibraryComment = z.infer<typeof LibraryCommentSchema>;
export type CreateLibraryCategory = z.infer<typeof CreateLibraryCategorySchema>;
export type CreateLibraryTag = z.infer<typeof CreateLibraryTagSchema>;
export type CreateLibraryResource = z.infer<typeof CreateLibraryResourceSchema>;
export type CreateLibraryComment = z.infer<typeof CreateLibraryCommentSchema>; 