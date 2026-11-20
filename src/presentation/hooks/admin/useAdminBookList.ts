'use client';

import { useEffect, useMemo, useState } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book, BookStatus } from '@/src/shared/types';
import { notifyBookStatus } from '@/src/presentation/utils/admin';
import { useAdminEvents } from './useAdminEvents';

export const ADMIN_BOOKS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export interface BookFilters {
  keyword: string;
  status: BookStatus | '';
  categoryId: number | null;
  authorId: number | null;
}

const EMPTY_FILTERS: BookFilters = { keyword: '', status: '', categoryId: null, authorId: null };

interface PageResult {
  key: string;
  books: Book[];
  totalPage: number;
}

type BooksRequest = { key: string; promise: ReturnType<typeof bookService.getBooks> };

// React Strict Mode (dev) chạy effect hai lần: dùng lại request đang chạy cùng key thay vì gọi API lần nữa
let inflight: BooksRequest | null = null;

const fetchBooksOnce = (key: string, query: Parameters<typeof bookService.getBooks>[0]) => {
  if (inflight?.key === key) return inflight.promise;
  const request: BooksRequest = { key, promise: bookService.getBooks(query) };
  inflight = request;
  const clear = () => {
    if (inflight === request) inflight = null;
  };
  request.promise.then(clear, clear);
  return request.promise;
};

/** Danh sách sách có phân trang và bộ lọc cho bảng "quản lý sách" của admin. */
export const useAdminBookList = () => {
  const [filters, setFilters] = useState<BookFilters>(EMPTY_FILTERS);
  const [page, setPage] = useState(0);
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<PageResult | null>(null);

  // Bản debounce của ô tìm kiếm để không gọi API sau mỗi phím gõ
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(filters.keyword.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [filters.keyword]);

  const { status, categoryId, authorId } = filters;
  const query = useMemo(
    () => ({
      page,
      size: ADMIN_BOOKS_PER_PAGE,
      bookName: debouncedKeyword || undefined,
      categoryId: categoryId ?? undefined,
      authorId: authorId ?? undefined,
      status: status || undefined,
    }),
    [page, debouncedKeyword, categoryId, authorId, status]
  );
  const requestKey = `${JSON.stringify(query)}#${reloadCount}`;

  // State chỉ được set trong callback của promise nên response cũ không bao giờ ghi đè response mới
  useEffect(() => {
    let active = true;
    fetchBooksOnce(requestKey, query).then(
      (data) => {
        if (active) setResult({ key: requestKey, books: data?.content ?? [], totalPage: data?.totalPage ?? 0 });
      },
      (error) => {
        console.error('Error fetching books:', error);
        if (active) setResult((prev) => ({ books: [], totalPage: 0, ...prev, key: requestKey }));
      }
    );
    return () => {
      active = false;
    };
  }, [query, requestKey]);

  const updateFilter = <K extends keyof BookFilters>(key: K, value: BookFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };

  /** Sửa một dòng ngay tại chỗ, không cần tải lại cả trang */
  const updateBook = (bookId: number, patch: Partial<Book>) =>
    setResult(
      (prev) =>
        prev && { ...prev, books: prev.books.map((book) => (book.id === bookId ? { ...book, ...patch } : book)) }
    );

  // OCR xong thì báo toast và đổi trạng thái ngay trên dòng; sách không nằm trong trang hiện tại
  // vẫn được báo (theo id) nhưng không có dòng nào để sửa
  useAdminEvents({
    onBookStatus: ({ bookId, status }) => {
      notifyBookStatus(status, result?.books.find((book) => book.id === bookId)?.title, bookId);
      updateBook(bookId, { status });
    },
    onReconnect: () => setReloadCount((count) => count + 1),
  });

  return {
    books: result?.books ?? [],
    page,
    totalPage: result?.totalPage ?? 0,
    isLoading: result?.key !== requestKey,
    filters,
    hasFilters: Boolean(filters.keyword || status || categoryId || authorId),
    updateFilter,
    resetFilters: () => {
      setFilters(EMPTY_FILTERS);
      setPage(0);
    },
    goToPage: setPage,
    reload: () => setReloadCount((count) => count + 1),
    updateBook,
  };
};
