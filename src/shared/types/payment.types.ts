// Payment/Purchase Types
import type { Book } from './book.types';

export interface Purchase {
  id: string;
  userId: string;
  bookId: string;
  book?: Book;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  purchasedAt: string;
}

export type PaymentMethod = 'WALLET' | 'BANKING' | 'MOMO' | 'ZALO_PAY';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PurchaseRequest {
  bookId: string;
  paymentMethod: PaymentMethod;
}
