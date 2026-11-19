'use client';

import { useCallback, useEffect, useState } from 'react';
import type { PaginatedResponse, SearchParams } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';

const SEARCH_DEBOUNCE_MS = 300;

interface Loaded<T> {
  key: string;
  data: PaginatedResponse<T> | null;
  error: string | null;
}

/**
 * Danh sách quản lý được lọc và phân trang phía server (tác giả, thể loại, giọng đọc...).
 * Từ khóa được debounce và mỗi lần tìm mới sẽ quay về trang đầu.
 * `fetchPage` phải ổn định qua các lần render, vd: một method của service.
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
        // Dòng cuối của một trang phía sau vừa bị xóa: lùi về trang cuối mới
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
    /** True cho tới khi có trang đầu tiên; các lần tải sau vẫn hiển thị dữ liệu cũ */
    isLoading: loaded.data === null && loaded.error === null,
    /** Đang có request chưa về, kể cả khi dữ liệu cũ vẫn hiển thị */
    isFetching: loaded.key !== requestKey,
    isFiltered: query.keyword !== '',
    error: loaded.error,
    reload,
  };
};
