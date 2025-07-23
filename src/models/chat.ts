import { z } from 'zod';

export const ChatGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ChatMessageSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  senderId: z.string(),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const ChatGroupMemberSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  userId: z.string(),
  role: z.enum(['ADMIN', 'MEMBER']),
  joinedAt: z.date()
});

export const CreateChatGroupSchema = ChatGroupSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreateChatMessageSchema = ChatMessageSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const CreateChatGroupMemberSchema = ChatGroupMemberSchema.omit({
  id: true,
  joinedAt: true
});

export type ChatGroup = z.infer<typeof ChatGroupSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatGroupMember = z.infer<typeof ChatGroupMemberSchema>;
export type CreateChatGroup = z.infer<typeof CreateChatGroupSchema>;
export type CreateChatMessage = z.infer<typeof CreateChatMessageSchema>;
export type CreateChatGroupMember = z.infer<typeof CreateChatGroupMemberSchema>; 