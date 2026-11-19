import type { Book, Chapter } from './book.types';

/** Customer lists do not download chapter text or editor documents. */
export type CustomerChapter = Pick<Chapter, 'id' | 'title' | 'chapterOrder' | 'duration' | 'audioUrl' | 'status'>;

export interface CustomerBookOverview {
  book: Book;
  chapterCount: number;
  totalDuration: number;
  firstChapter?: CustomerChapter | null;
}

export interface ChapterProgress {
  chapterId: number;
  chapterIndex: number;
  lastPlayAt: number;
  isComplete: boolean;
  updatedAt: string;
}

export interface ListeningResume {
  chapterId: number;
  chapterIndex: number;
  lastPlayAt: number;
}

export interface BookProgress {
  bookId: number;
  hasProgress: boolean;
  chapters: ChapterProgress[];
  chapterCount: number;
  completedChapterCount: number;
  isBookComplete: boolean;
  resume: ListeningResume | null;
}

export interface SaveListeningProgress {
  lastPlayAt: number;
  isComplete: boolean;
}
