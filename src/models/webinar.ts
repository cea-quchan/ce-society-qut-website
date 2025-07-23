import { z } from 'zod';

export const WebinarStatus = z.enum(['SCHEDULED', 'ONGOING', 'COMPLETED', 'CANCELLED']);

export const WebinarSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  startTime: z.date(),
  duration: z.number().int().positive(),
  maxParticipants: z.number().int().positive(),
  meetingLink: z.string().url(),
  hostId: z.string(),
  status: WebinarStatus,
  createdAt: z.date(),
  updatedAt: z.date()
});

export const WebinarParticipantSchema = z.object({
  id: z.string(),
  webinarId: z.string(),
  userId: z.string(),
  joinedAt: z.date().optional(),
  leftAt: z.date().optional()
});

export const WebinarCommentSchema = z.object({
  id: z.string(),
  webinarId: z.string(),
  authorId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreateWebinarSchema = WebinarSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

export const CreateWebinarParticipantSchema = WebinarParticipantSchema.omit({
  id: true,
  joinedAt: true,
  leftAt: true
});

export const CreateWebinarCommentSchema = WebinarCommentSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export type Webinar = z.infer<typeof WebinarSchema>;
export type WebinarParticipant = z.infer<typeof WebinarParticipantSchema>;
export type WebinarComment = z.infer<typeof WebinarCommentSchema>;
export type CreateWebinar = z.infer<typeof CreateWebinarSchema>;
export type CreateWebinarParticipant = z.infer<typeof CreateWebinarParticipantSchema>;
export type CreateWebinarComment = z.infer<typeof CreateWebinarCommentSchema>; 