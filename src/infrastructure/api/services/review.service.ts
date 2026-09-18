import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  Review,
  CreateReviewRequest,
  UpdateReviewRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/src/shared/types';

export const reviewService = {
  /**
   * Get reviews for a book
   */
  getBookReviews: async (
    bookId: string,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      API_ENDPOINTS.REVIEWS.LIST(bookId),
      { params }
    );
    return response.data;
  },

  /**
   * Create review for a book
   */
  createReview: async (
    bookId: string,
    data: CreateReviewRequest
  ): Promise<Review> => {
    const response = await apiClient.post<Review>(
      API_ENDPOINTS.REVIEWS.CREATE(bookId),
      data
    );
    return response.data;
  },

  /**
   * Update own review
   */
  updateReview: async (
    data: UpdateReviewRequest
  ): Promise<Review> => {
    const response = await apiClient.put<Review>(
      API_ENDPOINTS.REVIEWS.UPDATE(data.id),
      data
    );
    return response.data;
  },

  /**
   * Delete own review
   */
  deleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE(id));
  },

  /**
   * Get user's own reviews (for profile page)
   */
  getMyReviews: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      '/reviews/me',
      { params }
    );
    return response.data;
  },

  // ===== Admin Methods =====

  /**
   * Get all reviews (Admin)
   */
  getAllReviews: async (
    params?: PaginationParams & { bookId?: string; userId?: string }
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get<PaginatedResponse<Review>>(
      '/admin/reviews',
      { params }
    );
    return response.data;
  },

  /**
   * Delete any review (Admin)
   */
  adminDeleteReview: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/reviews/${id}`);
  },
};

export default reviewService;
