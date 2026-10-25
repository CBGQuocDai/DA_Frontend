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

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

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

  createBook: async (formData: FormData): Promise<Book> =>
    unwrap(await apiClient.post(API_ENDPOINTS.BOOKS.CREATE, formData, multipart)),

  updateBook: async (bookId: number, formData: FormData): Promise<Book> =>
    unwrap(await apiClient.put(API_ENDPOINTS.BOOKS.UPDATE(bookId), formData, multipart)),

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
