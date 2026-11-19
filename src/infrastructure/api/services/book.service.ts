import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { BestsellerPeriod, Book, BookPayload, GetBooksParams, PaginatedResponse } from '@/src/shared/types';

/** Các API quản lý sách của admin (BookController). */
export const bookService = {
  /** Danh sách sách có lọc và phân trang cho bảng quản lý. */
  getBooks: async (params: GetBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.ROOT, { params })),

  /** Sách bán chạy trong kỳ, kèm `purchases` và `previousPurchases` để so với kỳ trước. */
  getBestsellers: async (period: BestsellerPeriod): Promise<Book[]> =>
    unwrap<Book[]>(await apiClient.get(API_ENDPOINTS.BOOKS.BESTSELLERS, { params: { period } })) ?? [],

  /** Chi tiết sách, gồm cả danh sách chương, giọng đọc và URL file đã ký. */
  getBookById: async (bookId: number): Promise<Book> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.DETAIL(bookId))),

  createBook: async (payload: BookPayload): Promise<Book> =>
    unwrap(await apiClient.post(API_ENDPOINTS.BOOKS.ROOT, payload)),

  updateBook: async (bookId: number, payload: BookPayload): Promise<Book> =>
    unwrap(await apiClient.put(API_ENDPOINTS.BOOKS.DETAIL(bookId), payload)),

  /** Backend từ chối khi sách còn chương chưa có audio. */
  publishBook: async (bookId: number): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.BOOKS.PUBLISH(bookId));
  },

  unpublishBook: async (bookId: number): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.BOOKS.UNPUBLISH(bookId));
  },

  deleteBook: async (bookId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKS.DETAIL(bookId));
  },
};
