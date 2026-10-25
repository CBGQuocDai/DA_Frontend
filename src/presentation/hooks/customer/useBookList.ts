'use client';

import { useCallback, useState } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import { useAsyncData } from '../common';

interface UseBookListOptions {
  pageSize?: number;
  bookName?: string;
}

/** Paginated book list; `page` is zero-based to match the shared Pagination component. */
export const useBookList = ({ pageSize = 8, bookName }: UseBookListOptions = {}) => {
  // Keep the page together with the query it belongs to, so a new search starts at page 0
  const [pageState, setPageState] = useState({ bookName, page: 0 });
  const page = pageState.bookName === bookName ? pageState.page : 0;

  const load = useCallback(
    () => bookService.getBooks({ page, size: pageSize, bookName: bookName || undefined }),
    [page, pageSize, bookName]
  );
  const { data, error, isLoading, reload } = useAsyncData(load);

  const goToPage = useCallback(
    (nextPage: number) => setPageState({ bookName, page: nextPage }),
    [bookName]
  );

  return {
    books: data?.content ?? [],
    total: data?.total ?? 0,
    totalPage: data?.totalPage ?? 0,
    page,
    isLoading,
    error: error ? 'Không thể tải danh sách sách' : null,
    goToPage,
    reload,
  };
};
