import { User as ApiUser } from './api';

export interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  avatar?: string;
}

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
  rating?: number;
  students?: number;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  status: 'published' | 'draft' | 'archived';
  author: DashboardUser;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  updatedAt?: string;
  userId: string;
  link?: string;
  user?: ApiUser;
  metadata?: Record<string, unknown>;
}

export interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'info' | 'warning';
  autoHideDuration?: number;
}

export interface Message {
  id: number;
  content: string;
  senderId: number;
  receiverId: number;
  createdAt: string;
  read: boolean;
  sender: DashboardUser;
  receiver: DashboardUser;
  metadata?: {
    attachments?: Array<{
      type: string;
      url: string;
      name: string;
    }>;
    replyTo?: number;
    edited?: boolean;
    editedAt?: string;
  };
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  type: 'workshop' | 'seminar' | 'competition' | 'course' | 'article';
  status: 'upcoming' | 'ongoing' | 'completed';
  registeredCount: number;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface StatsData {
  totalUsers: number;
  totalCourses: number;
  totalArticles: number;
  totalEvents: number;
  totalEnrollments: number;
  totalRevenue: number;
  activeUsers: number;
  activeCourses: number;
  upcomingEvents: number;
}

export interface News {
  id: number;
  title: string;
  content: string;
  category?: string;
  imageUrl?: string;
  date: string;
  author: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
}

export interface DashboardData {
  notifications: Notification[];
  stats: {
    totalUsers: number;
    totalCourses: number;
    totalArticles: number;
    totalEnrollments: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user?: ApiUser;
  }>;
  users: DashboardUser[];
  courses: Course[];
  articles: Article[];
  messages: Message[];
  events: Event[];
  news: News[];
  faqs: FAQ[];
}

export interface PanelProps {
  data?: DashboardData;
  loading?: boolean;
  error?: string;
} 