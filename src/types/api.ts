import { NextApiRequest, NextApiResponse } from 'next';

// Error Codes
export type ErrorCode = 
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'METHOD_NOT_ALLOWED'
  | 'INTERNAL_SERVER_ERROR'
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'INVALID_CREDENTIALS'
  | 'EMAIL_EXISTS'
  | 'MAX_PARTICIPANTS_REACHED'
  | 'ALREADY_PARTICIPATED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'RATE_LIMIT_ERROR'
  | 'HELMET_ERROR'
  | 'COURSE_NOT_FOUND'
  | 'USER_NOT_FOUND'
  | 'ALREADY_ENROLLED'
  | 'EVENT_FULL'
  | 'ALREADY_REGISTERED'
  | 'CAPACITY_FULL'
  | 'CREATE_ERROR'
  | 'INVALID_REQUEST'
  | 'INVALID_URL'
  | 'INVALID_METHOD'
  | 'SERVER_ERROR'
  | 'CONFLICT'
  | 'INVALID_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_SECRET'
  | 'ADMIN_EXISTS'
  | 'USER_EXISTS';

// Base API Response
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  status?: number;
  timestamp?: string;
}

// API Error
export interface ApiError {
  message: string;
  code: ErrorCode;
  details?: unknown;
  field?: string;
  stack?: string;
}

// Pagination
export interface PaginationInfo {
  total: number;
  currentPage: number;
  limit: number;
  totalPages: number;
}

// Paginated Data
export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationInfo;
}

// Paginated Response
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>;

// Course Related
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    email: string;
  };
  lessons: {
    id: string;
    title: string;
    order: number;
  }[];
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourseResponse extends ApiResponse<Course> {
  data: Course;
}

export interface CoursesResponse extends ApiResponse<PaginatedData<Course>> {
  data: PaginatedData<Course>;
}

// Lesson Related
export interface LessonResponse extends ApiResponse<Lesson> {
  data: Lesson;
}

export interface LessonsResponse extends ApiResponse<PaginatedData<Lesson>> {
  data: PaginatedData<Lesson>;
}

// User Related
export interface UserResponse extends ApiResponse<User> {
  data: User;
}

export interface UsersResponse extends ApiResponse<PaginatedData<User>> {
  data: PaginatedData<User>;
}

// Auth Related
export interface LoginResponse extends ApiResponse<{
  user: User;
  token: string;
}> {
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterResponse extends ApiResponse<{
  user: User;
  token: string;
}> {
  data: {
    user: User;
    token: string;
  };
}

// File Upload Related
export interface FileUploadResponse extends ApiResponse<{
  urls: string[];
}> {
  data: {
    urls: string[];
  };
}

export interface FileUploadsResponse extends ApiResponse<{
  files: Array<{
    url: string;
    key: string;
  }>;
}> {
  data: {
    files: Array<{
      url: string;
      key: string;
    }>;
  };
}

// Error Responses
export interface ValidationErrorResponse extends ApiResponse<{ details: unknown }> {
  error: ApiError & { code: 'VALIDATION_ERROR' };
}

export interface UnauthorizedResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: 'UNAUTHORIZED';
  };
}

export interface ForbiddenResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: 'FORBIDDEN';
  };
}

export interface NotFoundResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: 'NOT_FOUND';
  };
}

export interface InternalServerErrorResponse extends ApiResponse {
  success: false;
  error: {
    message: string;
    code: 'INTERNAL_SERVER_ERROR';
    details?: unknown;
  };
}

export type ErrorResponse = 
  | ValidationErrorResponse 
  | UnauthorizedResponse 
  | ForbiddenResponse 
  | NotFoundResponse 
  | InternalServerErrorResponse;

// API Request Types
export interface PaginationQuery {
  page?: string;
  limit?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQuery extends PaginationQuery {
  search?: string;
  filter?: string;
}

// API Handler Types
export type ApiHandler<T = unknown> = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<T>>,
  user?: any
) => Promise<void>;

export type AuthenticatedApiHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  user?: any
) => Promise<void>;

export type Middleware = (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  next: () => void
) => Promise<void>;

export type ErrorMiddleware = (
  error: Error,
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>,
  next: (error: Error) => void
) => Promise<void>;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  duration: number;
  order: number;
  courseId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
  status: 'active' | 'inactive' | 'suspended';
  metadata?: Record<string, unknown>;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  preferences: {
    language?: string;
    theme?: string;
    notifications?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
  message?: string;
}

export interface EventResponse {
  success: boolean;
  data: {
    id: string;
    title: string;
    description: string;
    startDate: Date;
    endDate: Date;
    location: string;
    maxParticipants: number;
    currentParticipants: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
  };
  message?: string;
}

export interface EventsResponse extends ApiResponse<PaginatedData<Event>> {
  success: boolean;
  data: PaginatedData<Event>;
  message?: string;
}

export interface EventParticipantsResponse extends ApiResponse<PaginatedData<{ id: string; user: User; status: string; registeredAt: Date; }>> {
  success: boolean;
  data: PaginatedData<{ id: string; user: User; status: string; registeredAt: Date; }>;
  message?: string;
}

export interface CourseEnrollmentResponse extends ApiResponse<{
  enrollment: {
    id: string;
    userId: string;
    courseId: string;
    status: string;
    enrolledAt: Date;
  };
}> {
  data: {
    enrollment: {
      id: string;
      userId: string;
      courseId: string;
      status: string;
      enrolledAt: Date;
    };
  };
}

export interface NotificationResponse extends ApiResponse<{
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  link?: string;
  user?: User;
  metadata?: Record<string, unknown>;
}> {
  data: {
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt?: Date;
    userId: string;
    link?: string;
    user?: User;
    metadata?: Record<string, unknown>;
  };
}

export interface NotificationsResponse extends ApiResponse<PaginatedData<{
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt?: Date;
  userId: string;
  link?: string;
  user?: User;
  metadata?: Record<string, unknown>;
}>> {
  data: PaginatedData<{
    id: string;
    type: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
    updatedAt?: Date;
    userId: string;
    link?: string;
    user?: User;
    metadata?: Record<string, unknown>;
  }>;
}

export interface PaymentResponse {
  success: boolean;
  data: {
    id: string;
    amount: number;
    status: string;
    type: string;
    createdAt: Date;
  };
  message?: string;
}

export interface PaymentsResponse {
  success: boolean;
  data: Array<{
    id: string;
    amount: number;
    status: string;
    type: string;
    createdAt: Date;
  }>;
  message?: string;
}

export interface CommentResponse {
  success: boolean;
  data: {
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
  };
  message?: string;
}

export interface CommentsResponse {
  success: boolean;
  data: Array<{
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
  }>;
  message?: string;
}

export interface LikeResponse extends ApiResponse<{
  id: string;
  userId: string;
  targetId: string;
  targetType: string;
  createdAt: Date;
}> {
  data: {
    id: string;
    userId: string;
    targetId: string;
    targetType: string;
    createdAt: Date;
  };
}

export interface LikesResponse {
  success: boolean;
  data: Array<{
    id: string;
    userId: string;
    createdAt: Date;
  }>;
  message?: string;
}

export type MediaResponse = NextApiResponse & {
  setHeader(name: string, value: string): MediaResponse;
  end(data: Buffer): MediaResponse;
};

// API Route Types
export interface ApiRouteHandler<T = unknown> {
  (req: NextApiRequest & {
    query: Partial<Record<string, string | string[]>>;
    session?: {
      user?: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: string;
      };
    };
  }, res: NextApiResponse<ApiResponse<T>>): Promise<void>;
}

export interface AuthenticatedApiRouteHandler<T = unknown> extends ApiRouteHandler<T> {
  (req: NextApiRequest & {
    query: Partial<Record<string, string | string[]>>;
    session: {
      user: {
        id: string;
        email?: string | null;
        name?: string | null;
        image?: string | null;
        role?: string;
      };
    };
    user: { id: string };
  }, res: NextApiResponse<ApiResponse<T>>): Promise<void>;
} 

export type MessageData = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  senderId: string;
  groupId: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}; 

export interface NewsImage {
  id: string;
  url: string;
  newsId: string;
  order: number;
  caption?: string;
  thumbnailUrl?: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  imageUrl: string;
  caption?: string;
  thumbnailUrl?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
  uploaderId: string;
} 