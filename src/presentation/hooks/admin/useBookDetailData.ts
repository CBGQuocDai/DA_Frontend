'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookService, chapterService } from '@/src/infrastructure/api/services';
import type { Book, Chapter } from '@/src/shared/types';

const POLL_INTERVAL_MS = 4000;

/** Loads the book + its chapters, tracks the selected chapter, and polls while audio is processing. */
export const useBookDetailData = (bookId: number) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(
    async (isInitial = false) => {
      if (isInitial) setIsLoading(true);

      try {
        const [chaptersRes, bookRes] = await Promise.allSettled([
          chapterService.getChapters(bookId),
          bookService.getBookById(bookId),
        ]);

        const chaptersData: Chapter[] =
          chaptersRes.status === 'fulfilled' ? chaptersRes.value ?? [] : [];
        setChapters(chaptersData);

        setSelectedChapterId((prev) => {
          if (prev && chaptersData.some((c) => c.id === prev)) return prev;
          return chaptersData.length > 0 ? chaptersData[0].id : null;
        });

        let bookData: Book | null = bookRes.status === 'fulfilled' ? bookRes.value : null;

        if (!bookData && chaptersData.length > 0 && (chaptersData[0] as any).book) {
          bookData = (chaptersData[0] as any).book as Book;
        }

        if (bookData && (!bookData.coverImage || !bookData.coverImage.startsWith('http'))) {
          try {
            const listRes = await bookService.getBooks({ page: 0, size: 100 });
            const found = listRes?.content?.find((b) => b.id === Number(bookId));
            if (found?.coverImage) {
              bookData = { ...bookData, coverImage: found.coverImage };
            }
          } catch {
            // ignore
          }
        }

        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [bookId]
  );

  useEffect(() => {
    loadData(true);
  }, [loadData]);

  const hasProcessing = chapters.some((c) => c.status === 'PROCESSING_AUDIO');
  useEffect(() => {
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
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
