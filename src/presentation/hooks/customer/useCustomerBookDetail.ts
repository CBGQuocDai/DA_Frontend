'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { customerBookService } from '@/src/infrastructure/api/services';
import { createChapterPlayback } from '@/src/presentation/utils/customer/chapterPlayback';
import { getBookDetailError } from '@/src/presentation/utils/customer/bookDetailError';
import { useAsyncData } from '../common';

export const useCustomerBookDetail = (bookId: number) => {
  const chapterPlayback = useMemo(() => createChapterPlayback(
    () => customerBookService.getChapters(bookId),
  ), [bookId]);
  const playbackState = useSyncExternalStore(
    chapterPlayback.subscribe, chapterPlayback.getSnapshot, chapterPlayback.getSnapshot,
  );
  const loadOverview = useCallback(() => customerBookService.getOverview(bookId), [bookId]);
  const overview = useAsyncData(loadOverview);
  const overviewFailure = getBookDetailError(overview.error);
  const chapterList = useAsyncData(chapterPlayback.load);
  const reload = chapterList.reload;
  const reloadChapters = useCallback(() => {
    chapterPlayback.invalidate();
    reload();
  }, [chapterPlayback, reload]);

  return {
    book: overview.data?.book ?? null,
    chapterCount: chapterList.data?.length ?? overview.data?.chapterCount ?? 0,
    totalDuration: overview.data?.totalDuration ?? 0,
    chapters: chapterList.data ?? [],
    isLoading: overview.isLoading,
    isBookNotFound: overviewFailure.isNotFound,
    bookError: overviewFailure.message,
    reloadOverview: overview.reload,
    isChaptersLoading: chapterList.isLoading,
    chaptersError: chapterList.error ? 'Không thể tải danh sách chương. Vui lòng thử lại.' : null,
    reloadChapters,
    chapterPlayback,
    playbackState,
  };
};
