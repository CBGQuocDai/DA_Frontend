'use client';

import { useState, useEffect, useCallback } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book, Category } from '@/src/shared/types';

interface UseBooksReturn {
  books: Book[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPage: number;
  };
  loadBooks: (params?: { page?: number; size?: number }) => Promise<void>;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const useBooks = (initialParams?: { page?: number; size?: number }): UseBooksReturn => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 10,
    total: 0,
    totalPage: 0,
  });
  const [currentParams, setCurrentParams] = useState(initialParams || {});

  const loadBooks = useCallback(async (params?: { page?: number; size?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const mergedParams = { ...currentParams, ...params, page: 0 };
      setCurrentParams(mergedParams);
      const response = await bookService.getBooks(mergedParams);
      setBooks(response.content);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPage: response.totalPage,
      });
    } catch {
      setError('Không thể tải danh sách sách');
    } finally {
      setIsLoading(false);
    }
  }, [currentParams]);

  const loadMore = useCallback(async () => {
    if (pagination.page >= pagination.totalPage - 1 || isLoading) return;

    setIsLoading(true);
    try {
      const nextPage = pagination.page + 1;
      const response = await bookService.getBooks({ ...currentParams, page: nextPage });
      setBooks((prev) => [...prev, ...response.content]);
      setPagination({
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPage: response.totalPage,
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
  book: Book | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useBookDetail = (bookId: number): UseBookDetailReturn => {
  const [book, setBook] = useState<Book | null>(null);
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
