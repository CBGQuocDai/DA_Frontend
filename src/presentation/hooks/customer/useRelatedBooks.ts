'use client';

import { useCallback } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book } from '@/src/shared/types';
import { getBookAuthors, getBookCategories } from '@/src/shared/utils';
import { useAsyncData } from '../common';

const RELATED_LIMIT = 10;

interface RelatedBooks {
  sameAuthor: Book[];
  sameCategory: Book[];
}

const EMPTY: RelatedBooks = { sameAuthor: [], sameCategory: [] };

/** Books by the same first author and in the same first category, excluding the current book. */
export const useRelatedBooks = (book: Book | null) => {
  const bookId = book?.id;
  const authorId = getBookAuthors(book)[0]?.id;
  const categoryId = getBookCategories(book)[0]?.id;

  const load = useCallback(async (): Promise<RelatedBooks> => {
    if (bookId == null) return EMPTY;

    const [authorRes, categoryRes] = await Promise.allSettled([
      authorId != null
        ? bookService.getBooks({ page: 0, size: RELATED_LIMIT, authorId })
        : Promise.resolve(null),
      categoryId != null
        ? bookService.getBooksByCategory(categoryId, { page: 0, size: RELATED_LIMIT })
        : Promise.resolve(null),
    ]);

    const others = (res: typeof authorRes) =>
      res.status === 'fulfilled' ? (res.value?.content ?? []).filter((b) => b.id !== bookId) : [];

    return { sameAuthor: others(authorRes), sameCategory: others(categoryRes) };
  }, [bookId, authorId, categoryId]);

  const { data, isLoading } = useAsyncData(load);

  return { ...(data ?? EMPTY), isLoading };
};
