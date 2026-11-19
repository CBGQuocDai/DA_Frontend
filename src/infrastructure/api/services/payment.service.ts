import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Payment } from '@/src/shared/types';

export const paymentService = {
  /** Tạo đơn thanh toán PENDING cho sách, hoặc dùng lại đơn đang chờ nếu đã có. */
  createPayment: async (bookId: number): Promise<Payment> =>
    unwrap(await apiClient.post(API_ENDPOINTS.PAYMENTS.ROOT, { bookId })),

  getPayment: async (paymentId: number): Promise<Payment> =>
    unwrap(await apiClient.get(API_ENDPOINTS.PAYMENTS.DETAIL(paymentId))),
};
