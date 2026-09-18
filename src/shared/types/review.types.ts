// Review Types
export interface Review {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  bookId: string;
  rating: number;
  comment: string;
}

export interface UpdateReviewRequest {
  id: string;
  rating: number;
  comment: string;
}
