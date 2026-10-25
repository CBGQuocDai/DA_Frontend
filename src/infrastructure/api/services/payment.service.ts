import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Payment } from '@/src/shared/types';

export const paymentService = {
  /** Creates a PENDING payment for the book, or reuses the existing one. */
  createPayment: async (bookId: number): Promise<Payment> =>
    unwrap(await apiClient.post(API_ENDPOINTS.PAYMENTS.CREATE, { bookId })),

  getPayment: async (paymentId: number): Promise<Payment> =>
    unwrap(await apiClient.get(API_ENDPOINTS.PAYMENTS.DETAIL(paymentId))),

  hasPurchased: async (bookId: number): Promise<boolean> => {
    const data = unwrap<{ purchased?: boolean } | null>(
      await apiClient.get(API_ENDPOINTS.PAYMENTS.CHECK(bookId))
    );
    return Boolean(data?.purchased);
  },
};
