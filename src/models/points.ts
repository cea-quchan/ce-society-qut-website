import { z } from 'zod';

export const PointsSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number().int().positive(),
  activity: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreatePointsSchema = PointsSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const UpdatePointsSchema = CreatePointsSchema.partial();

export type Points = z.infer<typeof PointsSchema>;
export type CreatePoints = z.infer<typeof CreatePointsSchema>;
export type UpdatePoints = z.infer<typeof UpdatePointsSchema>; 