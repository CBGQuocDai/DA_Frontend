'use client';

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react';
import { customerBookService } from '@/src/infrastructure/api/services';
import { createChapterPlayback } from '@/src/presentation/utils/customer/chapterPlayback';
import { useAsyncData } from '../common';

const CHAPTER_PAGE_SIZE = 10;

/** Book metadata stays loaded while only the chapter list changes pages. */
export const useCustomerBookDetail = (bookId: number) => {
  const chapterPlayback = useMemo(() => createChapterPlayback(
    (chapterPage: number) => customerBookService.getChaptersPage(bookId, chapterPage, CHAPTER_PAGE_SIZE),
    CHAPTER_PAGE_SIZE,
  ), [bookId]);
  const playbackState = useSyncExternalStore(
    chapterPlayback.subscribe,
    chapterPlayback.getSnapshot,
    chapterPlayback.getSnapshot,
  );
  const [pageState, setPageState] = useState({ bookId, page: 0 });
  const page = pageState.bookId === bookId ? pageState.page : 0;
  const loadOverview = useCallback(() => customerBookService.getOverview(bookId), [bookId]);
  const overview = useAsyncData(loadOverview);
  const loadChapters = useCallback(
    () => chapterPlayback.loadPage(page),
    [chapterPlayback, page]
  );
  const chapterPage = useAsyncData(loadChapters);
  const reloadChapterPage = chapterPage.reload;
  const reloadChapters = useCallback(() => {
    chapterPlayback.invalidatePage(page);
    reloadChapterPage();
  }, [chapterPlayback, page, reloadChapterPage]);
  const chapterCount = chapterPage.data?.total ?? overview.data?.chapterCount ?? 0;
  const totalPage = chapterPage.data?.totalPage ?? Math.ceil(chapterCount / CHAPTER_PAGE_SIZE);

  const goToPage = useCallback((nextPage: number) => {
    if (Number.isInteger(nextPage) && nextPage >= 0 && nextPage < totalPage) {
      setPageState({ bookId, page: nextPage });
    }
  }, [bookId, totalPage]);

  return {
    book: overview.data?.book ?? null,
    chapterCount,
    totalDuration: overview.data?.totalDuration ?? 0,
    firstChapter: overview.data?.firstChapter ?? null,
    chapters: chapterPage.data?.content ?? [],
    isLoading: overview.isLoading,
    isChaptersLoading: chapterPage.isLoading,
    chaptersError: chapterPage.error ? 'Không thể tải danh sách chương. Vui lòng thử lại.' : null,
    reloadChapters,
    chapterPlayback,
    playbackState,
    page,
    pageSize: CHAPTER_PAGE_SIZE,
    totalPage,
    goToPage,
  };
};
