// Book Types
import type { Review } from './review.types';

export interface Book {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  author: string;
  narrator: string;
  duration: number; // in seconds
  audioUrl: string;
  category: Category;
  tags: string[];
  price: number;
  rating: number;
  totalListens: number;
  status: BookStatus;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookDetail extends Book {
  chapters: Chapter[];
  reviews: Review[];
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  orderIndex: number;
  duration: number; // in seconds
  audioUrl: string;
  createdAt: string;
}

export type BookStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  bookCount?: number;
}

export interface CreateBookRequest {
  title: string;
  description: string;
  coverImage?: string;
  author: string;
  narrator: string;
  duration?: number;
  audioUrl?: string;
  categoryId: string;
  tags?: string[];
  price?: number;
  status?: BookStatus;
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  id: string;
}
