'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SearchParams } from '@/src/infrastructure/api/services';
import type { PaginatedResponse } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';

const SEARCH_DEBOUNCE_MS = 300;

interface Loaded<T> {
  key: string;
  data: PaginatedResponse<T> | null;
  error: string | null;
}

/**
 * Server-side filtered and paged admin list (authors, categories...).
 * The keyword is debounced and going back to the first page follows each new search.
 * `fetchPage` must be stable, e.g. a service method.
 */
export const useAdminSearchList = <T>(
  fetchPage: (params: SearchParams) => Promise<PaginatedResponse<T>>,
  pageSize = 10,
) => {
  const [keyword, setKeyword] = useState('');
  const [query, setQuery] = useState({ keyword: '', page: 0 });
  const [reloadCount, setReloadCount] = useState(0);
  const [loaded, setLoaded] = useState<Loaded<T>>({ key: '', data: null, error: null });

  useEffect(() => {
    const trimmed = keyword.trim();
    const timer = setTimeout(
      () => setQuery((q) => (q.keyword === trimmed ? q : { keyword: trimmed, page: 0 })),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [keyword]);

  const requestKey = `${query.keyword}|${query.page}|${reloadCount}`;

  useEffect(() => {
    let cancelled = false;
    fetchPage({ keyword: query.keyword, page: query.page, size: pageSize })
      .then((data) => {
        if (cancelled) return;
        // The last row of a later page was deleted: step back to the new last page
        if (data.content.length === 0 && query.page > 0 && data.totalPage > 0) {
          setQuery((q) => ({ ...q, page: data.totalPage - 1 }));
          return;
        }
        setLoaded({ key: requestKey, data, error: null });
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Error fetching admin list:', error);
        setLoaded((prev) => ({
          key: requestKey,
          data: prev.data,
          error: getApiErrorMessage(error, 'Không tải được danh sách, kiểm tra kết nối rồi thử lại'),
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [fetchPage, pageSize, query, requestKey]);

  const setPage = useCallback((page: number) => setQuery((q) => ({ ...q, page })), []);
  const reload = useCallback(() => setReloadCount((n) => n + 1), []);
  const clearSearch = useCallback(() => {
    setKeyword('');
    setQuery({ keyword: '', page: 0 });
  }, []);

  return {
    items: loaded.data?.content ?? [],
    total: loaded.data?.total ?? 0,
    totalPage: Math.max(1, loaded.data?.totalPage ?? 1),
    page: query.page,
    pageSize,
    setPage,
    keyword,
    setKeyword,
    clearSearch,
    /** True until the first page arrives; later fetches keep showing the previous rows */
    isLoading: loaded.data === null && loaded.error === null,
    isFetching: loaded.key !== requestKey,
    isFiltered: query.keyword !== '',
    error: loaded.error,
    reload,
  };
};
