// Payment Types
export type PaymentStatus = 'PENDING' | 'PAID';

export interface Payment {
  id: number;
  paymentCode: string;
  bookId: number;
  amount: number;
  status: PaymentStatus;
  paymentStatus?: PaymentStatus;
  qrUrl?: string;
  paidAt?: string;
  createdAt?: string;
}
