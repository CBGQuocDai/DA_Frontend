'use client';

import { useCallback } from 'react';
import { bookService, categoryService } from '@/src/infrastructure/api/services';
import type { Book, Category } from '@/src/shared/types';
import { useAsyncData } from '../common';

const BOOKS_PER_SHELF = 10;

export interface CategoryShelf {
  category: Category;
  books: Book[];
  total: number;
}

const loadShelves = async (): Promise<CategoryShelf[]> => {
  const categories = await categoryService.getCategories();
  const results = await Promise.allSettled(
    categories.map((category) =>
      bookService.getBooksByCategory(category.id, { page: 0, size: BOOKS_PER_SHELF })
    )
  );

  return categories.map((category, index) => {
    const result = results[index];
    const page = result.status === 'fulfilled' ? result.value : null;
    return { category, books: page?.content ?? [], total: page?.total ?? 0 };
  });
};

const NO_SHELVES = Promise.resolve<CategoryShelf[]>([]);

/** Every category together with its first books, for the store page shelves. Pass `enabled = false` to skip the requests. */
export const useCategoryShelves = (enabled = true) => {
  const load = useCallback(() => (enabled ? loadShelves() : NO_SHELVES), [enabled]);
  const { data, error, isLoading, reload } = useAsyncData(load);

  return {
    shelves: data ?? [],
    isLoading,
    error: error ? 'Không thể tải danh sách danh mục' : null,
    reload,
  };
};
