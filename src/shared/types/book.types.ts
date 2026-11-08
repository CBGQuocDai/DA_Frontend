// Book Types

export interface StoredFile {
  /** Storage path: send it back in an update request to keep this file */
  path: string;
  /** Signed URL to read the file */
  url: string;
}

export interface Book {
  id: number;
  title: string;
  description?: string;
  coverImage?: StoredFile;
  contentFile?: StoredFile;
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
  /** Bestseller lists only: purchases in the chosen period, paid or free */
  purchases?: number;
  /** Bestseller lists only: purchases in the period before; absent for all time */
  previousPurchases?: number | null;
}

export interface Chapter {
  id: number;
  title: string;
  chapterOrder: number;
  duration?: number;
  audioUrl?: string;
  rawText?: string;
  /** Editor document with formatting; empty when the chapter is plain text */
  contentJson?: string;
  status?: ChapterStatus;
  /** TTS speed of the last audio generation; null for chapters created before it was stored */
  readingSpeed?: number | null;
}

export interface Voice {
  id: number;
  name: string;
  exampleAudio?: StoredFile;
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
  avatar?: StoredFile | null;
  bio?: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  /** Bestseller lists only: purchases of books in the category in the chosen period */
  purchases?: number;
  /** Bestseller lists only: purchases in the period before; absent for all time */
  previousPurchases?: number | null;
}

export type BookStatus = 'PROCESSING' | 'UNPUBLISHED' | 'PUBLISHED' | 'FAILED';
export type ChapterStatus = 'FAILED' | 'PROCESSING_AUDIO' | 'AUDIO_READY';
