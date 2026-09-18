import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  Purchase,
  PurchaseRequest,
  PaginatedResponse,
  PaginationParams,
} from '@/src/shared/types';

export const purchaseService = {
  /**
   * Get user's purchase history
   */
  getMyPurchases: async (
    params?: PaginationParams
  ): Promise<PaginatedResponse<Purchase>> => {
    const response = await apiClient.get<PaginatedResponse<Purchase>>(
      API_ENDPOINTS.PURCHASES.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Check if user has purchased a book
   */
  checkPurchase: async (bookId: string): Promise<boolean> => {
    const response = await apiClient.get<{ purchased: boolean }>(
      API_ENDPOINTS.PURCHASES.CHECK(bookId)
    );
    return response.data.purchased;
  },

  /**
   * Purchase a book
   */
  purchase: async (data: PurchaseRequest): Promise<Purchase> => {
    const response = await apiClient.post<Purchase>(
      API_ENDPOINTS.PURCHASES.CREATE,
      data
    );
    return response.data;
  },

  // ===== Admin Methods =====

  /**
   * Get all purchases (Admin)
   */
  getAllPurchases: async (
    params?: PaginationParams & { userId?: string; status?: string }
  ): Promise<PaginatedResponse<Purchase>> => {
    const response = await apiClient.get<PaginatedResponse<Purchase>>(
      '/admin/purchases',
      { params }
    );
    return response.data;
  },

  /**
   * Update purchase status (Admin)
   */
  updatePurchaseStatus: async (
    id: string,
    status: string
  ): Promise<Purchase> => {
    const response = await apiClient.patch<Purchase>(
      `/admin/purchases/${id}`,
      { status }
    );
    return response.data;
  },

  /**
   * Process refund (Admin)
   */
  refund: async (id: string): Promise<Purchase> => {
    const response = await apiClient.post<Purchase>(
      `/admin/purchases/${id}/refund`
    );
    return response.data;
  },
};

export default purchaseService;
