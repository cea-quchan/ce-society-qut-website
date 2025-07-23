import 'next-auth';
import { DefaultSession } from 'next-auth';
import { Role, User } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: User;
  }

  interface User {
    role: Role;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
  }
}

export interface AuthUser extends User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthSession {
  user: AuthUser;
  expires: string;
} 