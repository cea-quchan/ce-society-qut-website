import { z } from 'zod';

export class ValidationError extends Error {
  constructor(
    message: string,
    public details?: {
      errors: z.ZodIssue[];
    }
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = 'لطفا وارد حساب کاربری خود شوید') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message: string = 'شما دسترسی به این بخش را ندارید') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'مورد درخواستی یافت نشد') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string = 'خطا در پایگاه داده') {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class FileUploadError extends Error {
  constructor(message: string = 'خطا در آپلود فایل') {
    super(message);
    this.name = 'FileUploadError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'تعداد درخواست‌های شما بیش از حد مجاز است') {
    super(message);
    this.name = 'RateLimitError';
  }
}

export class SocketError extends Error {
  constructor(message: string = 'خطا در ارتباط با سرور') {
    super(message);
    this.name = 'SocketError';
  }
}

export class CacheError extends Error {
  constructor(message: string = 'خطا در کش') {
    super(message);
    this.name = 'CacheError';
  }
}

export class ExternalServiceError extends Error {
  constructor(
    message: string = 'خطا در سرویس خارجی',
    public service: string
  ) {
    super(message);
    this.name = 'ExternalServiceError';
  }
} 