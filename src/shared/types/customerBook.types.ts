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
