// Book Types

export interface Book {
  id: number;
  title: string;
  description?: string;
  coverImage?: string;
  contentFile?: string;
  isPublish?: boolean;
  price?: number;
  voice?: Voice;
  status: BookStatus;
  bookCategories?: BookCategory[];
  bookAuthors?: BookAuthor[];
  categories?: BookCategory[];
  authors?: BookAuthor[];
  chapters?: Chapter[];
  averageRating?: number;
  ratingCount?: number;
}

export interface Chapter {
  id: number;
  title: string;
  chapterOrder: number;
  duration?: number;
  audioUrl?: string;
  rawText?: string;
  status?: ChapterStatus;
}

export interface Voice {
  id: number;
  name: string;
  exampleAudio?: string;
  description?: string;
}

export interface BookCategory {
  id: number;
  category: Category;
}

export interface BookAuthor {
  id: number;
  author: Author;
}

export interface Author {
  id: number;
  fullName?: string;
  avatar?: string;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export type BookStatus = 'PROCESSING' | 'PUBLISHED';
export type ChapterStatus = 'PENDING_TEXT' | 'TEXT_READY' | 'PROCESSING_AUDIO' | 'AUDIO_READY';

export interface CreateBookRequest {
  title: string;
  description?: string;
  price?: number;
  voice?: Voice;
  categories?: Category[];
  authors?: Author[];
}

export interface UpdateBookRequest extends Partial<CreateBookRequest> {
  id: number;
}
