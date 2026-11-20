import type { Book, Chapter } from './book.types';

/** Danh sách chương phía khách hàng không tải nội dung văn bản hay tài liệu của trình soạn thảo. */
export type CustomerChapter = Pick<Chapter, 'id' | 'title' | 'chapterOrder' | 'duration' | 'audioUrl' | 'status'>;

export interface CustomerBookOverview {
  book: Book;
  chapterCount: number;
  totalDuration: number;
  firstChapter?: CustomerChapter | null;
}

export interface GetCustomerBooksParams {
  page?: number;
  size?: number;
  bookName?: string;
  categoryId?: number;
  authorId?: number;
}

export interface ChapterProgress {
  chapterId: number;
  chapterIndex: number;
  lastPlayAt: number;
  isComplete: boolean;
  updatedAt: string;
}

interface ListeningResume {
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
