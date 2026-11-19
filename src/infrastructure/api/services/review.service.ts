import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { GetReviewPageParams, MyReview, PaginatedResponse, Review, ReviewDraft, ReviewSummary } from '@/src/shared/types';

/** Các API đánh giá sách (ReviewController); các endpoint đọc đều công khai. */
export const reviewService = {
  getPage: async (bookId: number, params: GetReviewPageParams): Promise<PaginatedResponse<Review>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.PAGE(bookId), { params })),

  /** Điểm trung bình, tổng số đánh giá và số lượng theo từng mức sao. */
  getSummary: async (bookId: number): Promise<ReviewSummary> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.SUMMARY(bookId))),

  /** Đánh giá của khách hàng đang đăng nhập cho cuốn sách. */
  getMine: async (bookId: number): Promise<MyReview> =>
    unwrap(await apiClient.get(API_ENDPOINTS.REVIEWS.MINE(bookId))),

  /** Backend đặt tên trường là `rate` và `content` (ReviewCreateRequest). */
  create: async (bookId: number, draft: ReviewDraft): Promise<Review> =>
    unwrap(await apiClient.post(API_ENDPOINTS.REVIEWS.ROOT, {
      bookId, rate: draft.rating, content: draft.comment.trim(),
    })),
};
