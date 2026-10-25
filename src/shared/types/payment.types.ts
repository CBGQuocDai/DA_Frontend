// Payment/Purchase Types
import type { Book } from "./book.types";

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

export type PaymentMethod = "WALLET" | "BANKING" | "MOMO" | "ZALO_PAY";

export type PaymentStatus = "PENDING" | "PAID";

export interface PurchaseRequest {
  bookId: string | number;
  paymentMethod?: PaymentMethod;
}

export interface PaymentResponse {
  id: number;
  paymentId?: number;
  paymentCode: string;
  orderCode?: string;
  customerId: number;
  bookId: number;
  bookTitle?: string;
  bookCover?: string;
  amount: number;
  status: PaymentStatus;
  paymentStatus?: PaymentStatus;
  paidAt?: string;
  createdAt?: string;
  qrUrl?: string;
}
