'use client';

import { useCallback } from 'react';
import { customerBookService } from '@/src/infrastructure/api/services';
import type { Book } from '@/src/shared/types';
import { useAsyncData } from '../common';

const RELATED_LIMIT = 8;

/** The backend selects related books using all source authors/categories and excludes the source. */
export const useRelatedBooks = (book: Book | null) => {
  const bookId = book?.id;

  const load = useCallback(
    () => bookId == null ? Promise.resolve([]) : customerBookService.getRelatedBooks(bookId, RELATED_LIMIT),
    [bookId]
  );
  const { data, isLoading, error, reload } = useAsyncData(load);

  return {
    books: data ?? [],
    isLoading: bookId != null && isLoading,
    error: error ? 'Không thể tải sách liên quan. Vui lòng thử lại.' : null,
    reload,
  };
};
