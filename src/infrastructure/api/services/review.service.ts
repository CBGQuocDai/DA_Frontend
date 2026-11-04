import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { MyReview, PaginatedResponse, Review, ReviewDraft, ReviewSort, ReviewSummary } from '@/src/shared/types';

export const reviewService = {
  getPage: async (bookId: number, params: { page: number; size: number; rating?: number; sort: ReviewSort }): Promise<PaginatedResponse<Review>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.PAGE(bookId), { params })),

  getSummary: async (bookId: number): Promise<ReviewSummary> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.SUMMARY(bookId))),

  getMine: async (bookId: number): Promise<MyReview> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.MINE(bookId))),

  create: async (bookId: number, draft: ReviewDraft): Promise<Review> =>
    unwrap(await apiClient.post(API_ENDPOINTS.REVIEWS.CREATE, {
      bookId, rate: draft.rating, content: draft.comment.trim(),
    })),
};
