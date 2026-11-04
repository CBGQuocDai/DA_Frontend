import type { Book, Chapter } from './book.types';

/** Customer lists do not download chapter text or editor documents. */
export type CustomerChapter = Pick<Chapter, 'id' | 'title' | 'chapterOrder' | 'duration' | 'audioUrl' | 'status'>;

export interface CustomerBookOverview {
  book: Book;
  chapterCount: number;
  totalDuration: number;
  firstChapter?: CustomerChapter | null;
}
