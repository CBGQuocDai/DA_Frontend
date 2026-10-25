'use client';

import { useCallback, useMemo } from 'react';
import { bookService, chapterService } from '@/src/infrastructure/api/services';
import type { Book, Chapter } from '@/src/shared/types';
import { useAsyncData } from '../common';

interface BookDetailData {
  book: Book | null;
  chapters: Chapter[];
}

/** Loads a book and its chapters for the customer detail page. */
export const useCustomerBookDetail = (bookId: number) => {
  const load = useCallback(async (): Promise<BookDetailData> => {
    const [bookRes, chaptersRes] = await Promise.allSettled([
      bookService.getBookById(bookId),
      chapterService.getChapters(bookId),
    ]);
    return {
      book: bookRes.status === 'fulfilled' ? bookRes.value : null,
      chapters: chaptersRes.status === 'fulfilled' ? chaptersRes.value ?? [] : [],
    };
  }, [bookId]);

  const { data, isLoading } = useAsyncData(load);

  const chapters = useMemo(
    () => [...(data?.chapters ?? [])].sort((a, b) => a.chapterOrder - b.chapterOrder),
    [data]
  );

  return { book: data?.book ?? null, chapters, isLoading };
};
