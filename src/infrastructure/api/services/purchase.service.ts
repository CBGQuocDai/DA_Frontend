import { apiClient } from "../config/apiClient";
import { API_ENDPOINTS } from "@/src/shared/constants";
import {
  Purchase,
  PurchaseRequest,
  PaymentResponse,
  PaginatedResponse,
  PaginationParams,
} from "@/src/shared/types";

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const purchaseService = {
  /**
   * Tạo hoặc tái sử dụng đơn PENDING cho sách
   * POST /api/payments { bookId }
   */
  createPayment: async (bookId: number | string): Promise<PaymentResponse> => {
    const numericBookId = Number(bookId);
    if (isNaN(numericBookId)) {
      throw new Error("Mã sách không hợp lệ");
    }
    const response = await apiClient.post<ApiResponse<PaymentResponse> | PaymentResponse>(
      API_ENDPOINTS.PAYMENTS?.CREATE || "/payments",
      { bookId: numericBookId },
    );
    const resData = response.data;
    if ("data" in resData && (resData as ApiResponse<PaymentResponse>).data) {
      return (resData as ApiResponse<PaymentResponse>).data;
    }
    return resData as PaymentResponse;
  },

  /**
   * Lấy trạng thái giao dịch theo ID
   * GET /api/payments/{id}
   */
  getPaymentStatus: async (
    paymentId: number | string,
  ): Promise<PaymentResponse> => {
    const endpoint = API_ENDPOINTS.PAYMENTS?.STATUS
      ? API_ENDPOINTS.PAYMENTS.STATUS(paymentId)
      : `/payments/${paymentId}`;
    const response = await apiClient.get<ApiResponse<PaymentResponse> | PaymentResponse>(
      endpoint,
    );
    const resData = response.data;
    if ("data" in resData && (resData as ApiResponse<PaymentResponse>).data) {
      return (resData as ApiResponse<PaymentResponse>).data;
    }
    return resData as PaymentResponse;
  },

  /**
   * Lấy đơn PENDING hiện tại của sách (nếu có)
   * GET /api/payments/pending/{bookId}
   */
  getPendingPayment: async (
    bookId: number | string,
  ): Promise<PaymentResponse | null> => {
    const endpoint = API_ENDPOINTS.PAYMENTS?.PENDING
      ? API_ENDPOINTS.PAYMENTS.PENDING(bookId)
      : `/payments/pending/${bookId}`;
    const response = await apiClient.get<ApiResponse<PaymentResponse> | PaymentResponse>(
      endpoint,
    );
    const resData = response.data;
    if ("data" in resData) {
      return (resData as ApiResponse<PaymentResponse>).data || null;
    }
    return resData as PaymentResponse;
  },

  /**
   * Get user's purchase history
   */
  getMyPurchases: async (
    params?: PaginationParams,
  ): Promise<PaginatedResponse<Purchase>> => {
    const response = await apiClient.get<PaginatedResponse<Purchase>>(
      API_ENDPOINTS.PURCHASES.LIST,
      { params },
    );
    return response.data;
  },

  /**
   * Check if user has purchased a book
   */
  checkPurchase: async (bookId: string | number): Promise<boolean> => {
    const endpoint = API_ENDPOINTS.PAYMENTS?.CHECK
      ? API_ENDPOINTS.PAYMENTS.CHECK(bookId)
      : API_ENDPOINTS.PURCHASES.CHECK(String(bookId));
    const response = await apiClient.get<{ data?: { purchased: boolean }; purchased?: boolean }>(
      endpoint,
    );
    if (response.data?.data && typeof response.data.data.purchased === "boolean") {
      return response.data.data.purchased;
    }
    return Boolean(response.data.purchased);
  },

  /**
   * Purchase a book
   */
  purchase: async (data: PurchaseRequest): Promise<Purchase> => {
    const response = await apiClient.post<Purchase>(
      API_ENDPOINTS.PURCHASES.CREATE,
      data,
    );
    return response.data;
  },

  // ===== Admin Methods =====

  /**
   * Get all purchases (Admin)
   */
  getAllPurchases: async (
    params?: PaginationParams & { userId?: string; status?: string },
  ): Promise<PaginatedResponse<Purchase>> => {
    const response = await apiClient.get<PaginatedResponse<Purchase>>(
      "/admin/purchases",
      { params },
    );
    return response.data;
  },

  /**
   * Update purchase status (Admin)
   */
  updatePurchaseStatus: async (
    id: string,
    status: string,
  ): Promise<Purchase> => {
    const response = await apiClient.patch<Purchase>(`/admin/purchases/${id}`, {
      status,
    });
    return response.data;
  },

  /**
   * Process refund (Admin)
   */
  refund: async (id: string): Promise<Purchase> => {
    const response = await apiClient.post<Purchase>(
      `/admin/purchases/${id}/refund`,
    );
    return response.data;
  },
};

export default purchaseService;
