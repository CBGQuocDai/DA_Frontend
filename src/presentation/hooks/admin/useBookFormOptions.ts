'use client';

import { useEffect, useState } from 'react';
import { authorService, categoryService, voiceService } from '@/src/infrastructure/api/services';
import type { Author, Category, Voice } from '@/src/shared/types';

export interface BookFormOptions {
  categories: Category[];
  authors: Author[];
  voices: Voice[];
}

const EMPTY_OPTIONS: BookFormOptions = { categories: [], authors: [], voices: [] };

// Dùng chung cho mọi màn admin có sửa hoặc lọc sách; các danh sách này hiếm khi thay đổi
let optionsPromise: Promise<BookFormOptions> | null = null;

const loadOptions = async (): Promise<BookFormOptions> => {
  const [categories, authors, voices] = await Promise.allSettled([
    categoryService.getCategories(),
    authorService.getAuthors(),
    voiceService.getVoices(),
  ]);
  const options = {
    categories: categories.status === 'fulfilled' ? categories.value : [],
    authors: authors.status === 'fulfilled' ? authors.value : [],
    voices: voices.status === 'fulfilled' ? voices.value : [],
  };
  // Có danh sách tải lỗi thì lần mount sau tải lại
  if ([categories, authors, voices].some((result) => result.status === 'rejected')) {
    optionsPromise = null;
  }
  return options;
};

/** Gọi sau khi thêm/sửa/xóa giọng đọc, thể loại hoặc tác giả để lần mount sau tải lại. */
export const invalidateBookFormOptions = () => {
  optionsPromise = null;
};

/**
 * Thể loại, tác giả và giọng đọc cho form sách và bộ lọc, chỉ tải một lần mỗi phiên.
 * Truyền `enabled = false` để hoãn việc tải cho tới khi thực sự cần.
 */
export const useBookFormOptions = (enabled = true): BookFormOptions => {
  const [options, setOptions] = useState<BookFormOptions>(EMPTY_OPTIONS);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    optionsPromise ??= loadOptions();
    optionsPromise.then((loaded) => {
      if (!cancelled) setOptions(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return options;
};
