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

// Shared by every admin screen that edits or filters books; the lists rarely change
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
    voices: voices.status === 'fulfilled' ? voices.value.content ?? [] : [],
  };
  // Retry on next mount when anything failed
  if ([categories, authors, voices].some((result) => result.status === 'rejected')) {
    optionsPromise = null;
  }
  return options;
};

/** Call after creating/editing voices, categories or authors so the next mount refetches. */
export const invalidateBookFormOptions = () => {
  optionsPromise = null;
};

/** Categories, authors and voices used by the book form and filters, fetched once per session. */
export const useBookFormOptions = (): BookFormOptions => {
  const [options, setOptions] = useState<BookFormOptions>(EMPTY_OPTIONS);

  useEffect(() => {
    let cancelled = false;
    optionsPromise ??= loadOptions();
    optionsPromise.then((loaded) => {
      if (!cancelled) setOptions(loaded);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return options;
};
