'use client';

import { useCallback, useState } from 'react';
import { customerBookService } from '@/src/infrastructure/api/services';
import { useAsyncData } from '../common';

const CHAPTER_PAGE_SIZE = 10;

/** Book metadata stays loaded while only the chapter list changes pages. */
export const useCustomerBookDetail = (bookId: number) => {
  const [pageState, setPageState] = useState({ bookId, page: 0 });
  const page = pageState.bookId === bookId ? pageState.page : 0;
  const loadOverview = useCallback(() => customerBookService.getOverview(bookId), [bookId]);
  const overview = useAsyncData(loadOverview);
  const loadChapters = useCallback(
    () => customerBookService.getChaptersPage(bookId, page, CHAPTER_PAGE_SIZE),
    [bookId, page]
  );
  const chapterPage = useAsyncData(loadChapters);
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
    reloadChapters: chapterPage.reload,
    page,
    pageSize: CHAPTER_PAGE_SIZE,
    totalPage,
    goToPage,
  };
};
