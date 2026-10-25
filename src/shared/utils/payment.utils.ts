import type { Payment } from '@/src/shared/types';

export const isPaymentPaid = (payment?: Payment | null) =>
  payment?.status === 'PAID' || payment?.paymentStatus === 'PAID';
