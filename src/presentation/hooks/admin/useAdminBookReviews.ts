'use client';

import { useCallback, useState } from 'react';
import { reviewService } from '@/src/infrastructure/api/services';
import { useAsyncData } from '../common';

export const ADMIN_REVIEWS_PER_PAGE = 5;

/** Đánh giá của một cuốn sách cho admin xem: tổng hợp theo sao và danh sách phân trang, lọc theo số sao. */
export const useAdminBookReviews = (bookId: number) => {
  // null = mọi mức sao
  const [rating, setRating] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const loadSummary = useCallback(() => reviewService.getSummary(bookId), [bookId]);
  const loadPage = useCallback(
    () =>
      reviewService.getPage(bookId, {
        page,
        size: ADMIN_REVIEWS_PER_PAGE,
        rating: rating ?? undefined,
        sort: 'newest',
      }),
    [bookId, page, rating]
  );
  const summary = useAsyncData(loadSummary);
  // Giữ trang cũ trong lúc tải trang mới để danh sách không nhấp nháy
  const reviews = useAsyncData(loadPage, { keepPrevious: true });

  return {
    summary: summary.data,
    reviews: reviews.data?.content ?? [],
    /** Số đánh giá khớp bộ lọc hiện tại */
    total: reviews.data?.total ?? 0,
    totalPage: reviews.data?.totalPage ?? 0,
    page,
    setPage,
    rating,
    setRating: (next: number | null) => {
      setRating(next);
      setPage(0);
    },
    isLoading: reviews.data === undefined && !reviews.error,
    isRefreshing: reviews.isRefreshing,
    error: reviews.error ?? summary.error,
    reload: () => {
      summary.reload();
      reviews.reload();
    },
  };
};
