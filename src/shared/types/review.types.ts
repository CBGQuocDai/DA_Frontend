// Review Types
export interface Review {
  id: number;
  bookId: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
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
