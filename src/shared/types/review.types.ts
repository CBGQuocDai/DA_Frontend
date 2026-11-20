// Kiểu dữ liệu đánh giá sách
export interface Review {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  /** Thời điểm tạo, dạng ISO 8601 */
  createdAt?: string;
  updatedAt?: string;
  verifiedPurchase?: boolean;
}

export type ReviewSort = 'newest' | 'highest';

export interface ReviewSummary {
  averageRating: number;
  totalReviews: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export interface MyReview {
  hasReviewed: boolean;
  review?: Review | null;
}

export interface ReviewDraft {
  rating: number;
  comment: string;
}

export interface GetReviewPageParams {
  /** Bắt đầu từ 0 */
  page: number;
  size: number;
  /** Chỉ lấy đánh giá đúng số sao này */
  rating?: number;
  sort: ReviewSort;
}
