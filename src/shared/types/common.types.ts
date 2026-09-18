// Common/Shared Types
import type { Book } from './book.types';
import type { Review } from './review.types';

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends PaginationParams {
  keyword?: string;
  categoryId?: string;
  author?: string;
  narrator?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
}

export interface DashboardStats {
  totalBooks: number;
  totalUsers: number;
  totalRevenue: number;
  totalListens: number;
  monthlyRevenue: number;
  monthlyUsers: number;
  topBooks: Book[];
  recentReviews: Review[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

// Re-export common types
export type { Book, Category, Chapter } from './book.types';
export type { Review } from './review.types';
export type { User } from './auth.types';
