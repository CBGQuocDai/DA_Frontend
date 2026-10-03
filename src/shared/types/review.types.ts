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
}

export interface CreateReviewRequest {
  bookId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  id: number;
  rating: number;
  comment: string;
}
