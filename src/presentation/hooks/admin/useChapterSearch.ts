'use client';

import { useState, useMemo } from 'react';
import type { Chapter } from '@/src/shared/types';

export const useChapterSearch = (chapters: Chapter[]) => {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chapters;
    return chapters.filter(
      (c) =>
        c.title?.toLowerCase().includes(q) ||
        `chương ${c.chapterOrder}`.includes(q) ||
        String(c.chapterOrder) === q
    );
  }, [chapters, query]);

  return { query, setQuery, filtered };
};
