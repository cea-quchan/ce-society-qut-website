import { z } from 'zod';

export const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string(),
  text: z.string().optional(),
  html: z.string().optional()
});

export type Email = z.infer<typeof EmailSchema>;

export const WelcomeEmailSchema = z.object({
  email: z.string().email(),
  name: z.string()
});

export type WelcomeEmail = z.infer<typeof WelcomeEmailSchema>;

export const PasswordResetEmailSchema = z.object({
  email: z.string().email(),
  resetToken: z.string()
});

export type PasswordResetEmail = z.infer<typeof PasswordResetEmailSchema>;

export const CourseEnrollmentEmailSchema = z.object({
  email: z.string().email(),
  name: z.string(),
  courseTitle: z.string()
});

export type CourseEnrollmentEmail = z.infer<typeof CourseEnrollmentEmailSchema>; 