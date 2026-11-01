import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Book, BookStatus, PaginatedResponse } from '@/src/shared/types';

export interface GetBooksParams {
  page?: number;
  size?: number;
  bookName?: string;
  categoryId?: number;
  authorId?: number;
  status?: BookStatus;
}

/**
 * Body of both create (POST) and update (PUT, full replacement). Files are
 * uploaded beforehand (uploadService) and sent as storage paths; both are always
 * required, and an update keeps a file by sending its current path.
 */
export interface BookPayload {
  title: string;
  description: string;
  price: number;
  voiceId: number;
  categoryIds: number[];
  authorIds: number[];
  contentFile?: string;
  coverImage?: string;
}

export const bookService = {
  getBooks: async (params?: GetBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.LIST, { params })),

  getBooksByCategory: async (
    categoryId: number,
    params?: Pick<GetBooksParams, 'page' | 'size'>
  ): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.BY_CATEGORY(categoryId), { params })),

  getBookById: async (id: number): Promise<Book> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.DETAIL(id))),

  createBook: async (payload: BookPayload): Promise<Book> =>
    unwrap(await apiClient.post(API_ENDPOINTS.BOOKS.CREATE, payload)),

  updateBook: async (bookId: number, payload: BookPayload): Promise<Book> =>
    unwrap(await apiClient.put(API_ENDPOINTS.BOOKS.UPDATE(bookId), payload)),

  publishBook: async (bookId: number): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.BOOKS.PUBLISH(bookId));
  },

  unpublishBook: async (bookId: number): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.BOOKS.UNPUBLISH(bookId));
  },

  deleteBook: async (bookId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKS.DELETE(bookId));
  },
};
