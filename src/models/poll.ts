import { z } from 'zod';

export const PollStatus = z.enum(['ACTIVE', 'CLOSED', 'CANCELLED']);

export const PollOptionSchema = z.object({
  id: z.string(),
  pollId: z.string(),
  text: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const PollVoteSchema = z.object({
  id: z.string(),
  pollId: z.string(),
  optionId: z.string(),
  userId: z.string(),
  createdAt: z.date()
});

export const PollSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  creatorId: z.string(),
  status: PollStatus,
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const CreatePollOptionSchema = PollOptionSchema.omit({
  id: true,
  pollId: true,
  createdAt: true,
  updatedAt: true
});

export const CreatePollVoteSchema = PollVoteSchema.omit({
  id: true,
  createdAt: true
});

export const CreatePollSchema = PollSchema.omit({
  id: true,
  status: true,
  createdAt: true,
  updatedAt: true
});

export type Poll = z.infer<typeof PollSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
export type PollVote = z.infer<typeof PollVoteSchema>;
export type CreatePoll = z.infer<typeof CreatePollSchema>;
export type CreatePollOption = z.infer<typeof CreatePollOptionSchema>;
export type CreatePollVote = z.infer<typeof CreatePollVoteSchema>; 