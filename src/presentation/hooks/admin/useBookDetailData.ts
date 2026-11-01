'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookService, chapterService } from '@/src/infrastructure/api/services';
import type { Book, Chapter } from '@/src/shared/types';

const POLL_INTERVAL_MS = 4000;

/** Loads the book (chapters included), tracks the selected chapter, and polls while audio is processing. */
export const useBookDetailData = (bookId: number) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // The detail payload already carries chapters, voice, authors, categories and signed file URLs
      const { chapters: chaptersData = [], ...bookData } = await bookService.getBookById(bookId);
      setBook(bookData);
      setChapters(chaptersData);
      setSelectedChapterId((prev) => {
        if (prev && chaptersData.some((c) => c.id === prev)) return prev;
        return chaptersData.length > 0 ? chaptersData[0].id : null;
      });
    } catch (error) {
      console.error('Error fetching book detail:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const hasProcessing = chapters.some((c) => c.status === 'PROCESSING_AUDIO');
  useEffect(() => {
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      // No need to poll while the tab is in the background
      if (document.hidden) return;
      try {
        const updated = await chapterService.getChapters(bookId);
        setChapters(updated ?? []);
      } catch (err) {
        console.error('Error polling chapters:', err);
      }
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [hasProcessing, bookId]);

  const sortedChapters = useMemo(
    () => [...chapters].sort((a, b) => a.chapterOrder - b.chapterOrder),
    [chapters]
  );

  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0] || null;
  const activeChapterIndex = sortedChapters.findIndex((c) => c.id === activeChapter?.id);
  const nextChapterOrder =
    chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapterOrder)) + 1 : 1;

  return {
    book,
    setBook,
    chapters,
    setChapters,
    sortedChapters,
    selectedChapterId,
    setSelectedChapterId,
    activeChapter,
    activeChapterIndex,
    nextChapterOrder,
    isLoading,
    loadData,
  };
};
