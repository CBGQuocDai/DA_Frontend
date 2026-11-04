'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { reviewService } from '@/src/infrastructure/api/services';
import { getApiErrorMessage, getApiErrorStatus } from '@/src/shared/utils';
import type { MyReview, Review, ReviewDraft, ReviewSort } from '@/src/shared/types';
import { useAsyncData } from '../common';

const PAGE_SIZE = 3;
interface Query { bookId: number; rating: number; sort: ReviewSort }
interface PageResult {
  key: string;
  requestId: string;
  items: Review[];
  total: number;
  totalPage: number;
  lastPage: number;
  error: string | null;
}
interface Mutation {
  scope: string;
  isSubmitting: boolean;
  error: string | null;
  created?: Review;
}

const keyFor = (query: Query) => `${query.bookId}:${query.rating}:${query.sort}`;

/** Public pages and global statistics, with a separate authenticated "my review" read. */
export const useBookReviews = (bookId: number, customerId: string | undefined, isReady: boolean) => {
  const [queryState, setQueryState] = useState<Query>({ bookId, rating: 0, sort: 'newest' });
  const rating = queryState.bookId === bookId ? queryState.rating : 0;
  const sort = queryState.bookId === bookId ? queryState.sort : 'newest';
  const key = keyFor({ bookId, rating, sort });
  const [request, setRequest] = useState({ key, page: 0, version: 0 });
  // Reset the cursor when navigating between books in the same mounted page.
  if (queryState.bookId !== bookId) {
    setQueryState({ bookId, rating: 0, sort: 'newest' });
    setRequest({ key, page: 0, version: request.version + 1 });
  }
  const page = request.key === key ? request.page : 0;
  const version = request.key === key ? request.version : 0;
  const [refreshVersion, setRefreshVersion] = useState(0);
  const requestId = `${key}:${page}:${version}:${refreshVersion}`;
  const [result, setResult] = useState<PageResult | null>(null);

  useEffect(() => {
    let active = true;
    reviewService.getPage(bookId, { page, size: PAGE_SIZE, rating: rating || undefined, sort }).then(
      (data) => {
        if (!active) return;
        // A deletion may have invalidated the requested page: recover with a fresh first page.
        if (page > 0 && data.totalPage > 0 && page >= data.totalPage) {
          setRequest((current) => ({ key, page: 0, version: current.version + 1 }));
          return;
        }
        setResult((current) => {
          const previous = page > 0 && current?.key === key && data.total > 0 ? current.items : [];
          const items = [...new Map([...previous, ...data.content].map((item) => [item.id, item])).values()];
          return { key, requestId, items, total: data.total, totalPage: data.totalPage, lastPage: page, error: null };
        });
      },
      (error) => {
        if (!active) return;
        setResult((current) => ({
          key, requestId,
          items: current?.key === key ? current.items : [],
          total: current?.key === key ? current.total : 0,
          totalPage: current?.key === key ? current.totalPage : 0,
          lastPage: current?.key === key ? current.lastPage : -1,
          error: getApiErrorMessage(error, 'Không thể tải đánh giá. Vui lòng thử lại.'),
        }));
      }
    );
    return () => { active = false; };
  }, [bookId, rating, sort, page, key, requestId]);

  const current = result?.key === key ? result : null;
  const isFetching = current?.requestId !== requestId;
  const loadSummary = useCallback(() => {
    // The revision is a dependency so a successful write refreshes global totals.
    void refreshVersion;
    return reviewService.getSummary(bookId);
  }, [bookId, refreshVersion]);
  const summary = useAsyncData(loadSummary);
  const loadMine = useCallback((): Promise<MyReview> => {
    void refreshVersion;
    return isReady && customerId ? reviewService.getMine(bookId) : Promise.resolve({ hasReviewed: false });
  }, [bookId, customerId, isReady, refreshVersion]);
  const mine = useAsyncData(loadMine);

  const scope = `${bookId}:${customerId ?? 'guest'}`;
  const [mutation, setMutation] = useState<Mutation | null>(null);
  const mutationForScope = mutation?.scope === scope ? mutation : null;
  const pending = useRef<symbol | null>(null);
  const generation = useRef(0);
  useEffect(() => {
    generation.current += 1;
    pending.current = null;
    return () => { generation.current += 1; };
  }, [scope]);

  const reloadFirstPage = () => {
    const defaultQuery: Query = { bookId, rating: 0, sort: 'newest' };
    setQueryState(defaultQuery);
    setRequest((currentRequest) => ({ key: keyFor(defaultQuery), page: 0, version: currentRequest.version + 1 }));
    setRefreshVersion((currentVersion) => currentVersion + 1);
  };

  const submit = async (draft: ReviewDraft): Promise<boolean> => {
    if (!isReady || !customerId || pending.current) return false;
    const ticket = Symbol();
    const atGeneration = generation.current;
    pending.current = ticket;
    setMutation({ scope, isSubmitting: true, error: null });
    try {
      const created = await reviewService.create(bookId, draft);
      if (generation.current !== atGeneration) return false;
      setMutation({ scope, isSubmitting: false, error: null, created });
      reloadFirstPage();
      return true;
    } catch (error) {
      if (generation.current !== atGeneration) return false;
      setMutation({ scope, isSubmitting: false, error: getApiErrorMessage(error, 'Không thể gửi đánh giá. Vui lòng thử lại.') });
      // A retry after a lost POST response can return 409: read back the saved state.
      if (getApiErrorStatus(error) === 409) reloadFirstPage();
      return false;
    } finally {
      if (pending.current === ticket) pending.current = null;
    }
  };

  const created = mutationForScope?.created;
  const changeQuery = (next: Query) => {
    setQueryState(next);
    setRequest((currentRequest) => ({ key: keyFor(next), page: 0, version: currentRequest.version + 1 }));
  };
  return {
    items: current?.items ?? [],
    total: current?.total ?? 0,
    filter: rating,
    sort,
    setFilter: (nextRating: number) => changeQuery({ bookId, rating: nextRating, sort }),
    setSort: (nextSort: ReviewSort) => changeQuery({ bookId, rating, sort: nextSort }),
    isLoading: isFetching && page === 0,
    isLoadingMore: isFetching && page > 0,
    listError: isFetching ? null : current?.error ?? null,
    hasMore: Boolean(current && current.lastPage + 1 < current.totalPage),
    loadMore: () => {
      if (!isFetching && current && current.lastPage + 1 < current.totalPage) {
        setRequest((currentRequest) => ({ key, page: current.lastPage + 1, version: currentRequest.version + 1 }));
      }
    },
    retryList: () => setRequest((currentRequest) => ({ key, page, version: currentRequest.version + 1 })),
    summary: summary.data ?? null,
    isSummaryLoading: summary.isLoading,
    summaryError: summary.error ? 'Không thể tải tổng hợp đánh giá.' : null,
    retrySummary: summary.reload,
    mine: created ? { hasReviewed: true, review: created } : mine.data ?? null,
    isMineLoading: !created && isReady && Boolean(customerId) && mine.isLoading,
    mineError: !created && mine.error ? 'Không thể kiểm tra đánh giá của bạn. Vui lòng thử lại.' : null,
    retryMine: mine.reload,
    isSubmitting: mutationForScope?.isSubmitting ?? false,
    submitError: mutationForScope?.error ?? null,
    submit,
  };
};
