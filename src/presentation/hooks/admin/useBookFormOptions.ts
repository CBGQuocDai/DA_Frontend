'use client';

import { useEffect, useState } from 'react';
import { authorService, categoryService, voiceService } from '@/src/infrastructure/api/services';
import type { Author, Category, Voice } from '@/src/shared/types';

export interface BookFormOptions {
  categories: Category[];
  authors: Author[];
  voices: Voice[];
}

type FilterOptions = Pick<BookFormOptions, 'categories' | 'authors'>;

// Dùng chung cho mọi màn admin có sửa hoặc lọc sách; các danh sách này hiếm khi thay đổi.
// Thể loại + tác giả (bộ lọc và form) và giọng đọc (chỉ form) được cache riêng
// để trang danh sách không tải giọng đọc khi chưa mở form.
let filterPromise: Promise<FilterOptions> | null = null;
let voicesPromise: Promise<Voice[]> | null = null;

const loadFilterOptions = async (): Promise<FilterOptions> => {
  const [categories, authors] = await Promise.allSettled([
    categoryService.getCategories(),
    authorService.getAuthors(),
  ]);
  // Có danh sách tải lỗi thì lần mount sau tải lại
  if (categories.status === 'rejected' || authors.status === 'rejected') filterPromise = null;
  return {
    categories: categories.status === 'fulfilled' ? categories.value : [],
    authors: authors.status === 'fulfilled' ? authors.value : [],
  };
};

const loadVoices = (): Promise<Voice[]> =>
  voiceService.getVoices().catch((error) => {
    console.error('Error fetching voices:', error);
    voicesPromise = null;
    return [];
  });

/** Gọi sau khi thêm/sửa/xóa giọng đọc, thể loại hoặc tác giả để lần mount sau tải lại. */
export const invalidateBookFormOptions = () => {
  filterPromise = null;
  voicesPromise = null;
};

/**
 * Thể loại, tác giả và giọng đọc cho form sách và bộ lọc, chỉ tải một lần mỗi phiên.
 * `enabled = false` hoãn toàn bộ; `withVoices = false` chỉ tải thể loại + tác giả
 * (giọng đọc chỉ cần khi form mở).
 */
export const useBookFormOptions = (enabled = true, withVoices = enabled): BookFormOptions => {
  const [filters, setFilters] = useState<FilterOptions>({ categories: [], authors: [] });
  const [voices, setVoices] = useState<Voice[]>([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    filterPromise ??= loadFilterOptions();
    filterPromise.then((loaded) => {
      if (!cancelled) setFilters(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!withVoices) return;
    let cancelled = false;
    voicesPromise ??= loadVoices();
    voicesPromise.then((loaded) => {
      if (!cancelled) setVoices(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [withVoices]);

  return { ...filters, voices };
};
