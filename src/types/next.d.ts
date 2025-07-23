import { IncomingMessage, ServerResponse } from 'http';
import { Session } from 'next-auth';
import { User } from '@prisma/client';
import { Fields, Files } from 'formidable';
import { ApiResponse } from './api';

declare module 'next' {
  export interface NextApiRequest extends IncomingMessage {
    session?: Session;
    user?: User;
    files?: Files;
    body?: Fields;
    query: {
      [key: string]: string | string[] | undefined;
    };
  }

  export interface NextApiResponse<T = unknown> extends ServerResponse {
    json(body: ApiResponse<T>): void;
    status(statusCode: number): NextApiResponse<T>;
  }
}

// Extend formidable types
declare module 'formidable' {
  export interface File {
    size: number;
    filepath: string;
    originalFilename: string;
    mimetype: string;
    hash?: string;
  }

  export interface Fields {
    [key: string]: string | string[];
  }

  export interface Files {
    [key: string]: File | File[];
  }
}

// Extend next-auth types
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