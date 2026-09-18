'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import { Book, BookDetail, Category, SearchParams } from '@/src/shared/types';

interface UseBooksReturn {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  loadBooks: (params?: SearchParams) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useBooks = (initialParams?: SearchParams): UseBooksReturn => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentParams, setCurrentParams] = useState<SearchParams>(initialParams || {});

  const loadBooks = useCallback(async (params?: SearchParams) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedParams = { ...currentParams, ...params, page: 1 };
      setCurrentParams(mergedParams);
      const response = await bookService.getBooks(mergedParams);
      setBooks(response.data);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError('Không thể tải danh sách sách');
    } finally {
      setIsLoading(false);
    }
  }, [currentParams]);

  const loadMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPages || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await bookService.getBooks({ ...currentParams, page: nextPage });
      setBooks((prev) => [...prev, ...response.data]);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch {
      setError('Không thể tải thêm sách');
    } finally {
      setIsLoading(false);
    }
  }, [currentParams, pagination, isLoading]);

  const refresh = useCallback(async () => {
    await loadBooks(currentParams);
  }, [loadBooks, currentParams]);

  useEffect(() => {
    loadBooks();
  }, []);

  return {
    books,
    isLoading,
    error,
    pagination,
    loadBooks,
    loadMore,
    refresh,
  };
};

interface UseBookDetailReturn {
  book: BookDetail | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useBookDetail = (bookId: string): UseBookDetailReturn => {
  const [book, setBook] = useState<BookDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBook = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookService.getBookById(bookId);
      setBook(data);
    } catch {
      setError('Không thể tải chi tiết sách');
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadBook();
  }, [loadBook]);

  return { book, isLoading, error, refresh: loadBook };
};

interface UseCategoriesReturn {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await bookService.getCategories();
      setCategories(data);
    } catch {
      setError('Không thể tải danh mục');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return { categories, isLoading, error, refresh: loadCategories };
};

export default useBooks;
