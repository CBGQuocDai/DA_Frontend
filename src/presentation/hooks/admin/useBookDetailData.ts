'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { bookService, chapterService } from '@/src/infrastructure/api/services';
import type { Book, Chapter } from '@/src/shared/types';
import { useAdminEvents } from './useAdminEvents';

/** Tải sách (kèm các chương), theo dõi chương đang chọn và nhận trạng thái OCR, gen audio qua SSE. */
export const useBookDetailData = (bookId: number) => {
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      // Response chi tiết đã có sẵn chương, giọng đọc, tác giả, thể loại và URL file đã ký
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

  // Trạng thái OCR và gen audio về qua SSE; nối lại sau khi rớt thì tải lại vì event đã lỡ không được phát lại
  useAdminEvents({
    onChapterStatus: (event) => {
      if (event.bookId !== bookId) return;
      setChapters((prev) =>
        prev.map((c) =>
          c.id === event.chapterId ? { ...c, status: event.status, duration: event.duration ?? c.duration } : c
        )
      );
      // `audioUrl` trong event là đường dẫn storage chưa ký, nên đọc lại danh sách chương để lấy URL đã ký
      if (event.status === 'AUDIO_READY') {
        chapterService
          .getChapters(bookId)
          .then(setChapters)
          .catch((error) => console.error('Error reloading chapters:', error));
      }
    },
    // OCR xong mới có danh sách chương nên tải lại cả sách
    onBookStatus: (event) => {
      if (event.bookId === bookId) loadData();
    },
    onReconnect: loadData,
  });

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
