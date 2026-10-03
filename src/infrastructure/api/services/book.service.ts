import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { PaginatedResponse, Category } from '@/src/shared/types';
import type { Book } from '@/src/shared/types';

export const bookService = {
  getBooks: async (params?: { page?: number; size?: number }): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.BOOKS.LIST,
      { params }
    );
    return response.data?.data ?? response.data;
  },

  getBookById: async (id: number): Promise<Book> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.BOOKS.DETAIL(String(id)));
    return response.data?.data ?? response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>(API_ENDPOINTS.BOOKS.CATEGORIES);
    return response.data?.data ?? response.data;
  },

  createBook: async (formData: FormData): Promise<Book> => {
    const response = await apiClient.post<any>(API_ENDPOINTS.BOOKS.CREATE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? response.data;
  },

  updateBook: async (bookId: number, formData: FormData): Promise<Book> => {
    const response = await apiClient.put<any>(`${API_ENDPOINTS.BOOKS.LIST}/${bookId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? response.data;
  },

  publishBook: async (bookId: number): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.BOOKS.LIST}/${bookId}/publish`);
  },

  unpublishBook: async (bookId: number): Promise<void> => {
    await apiClient.put(`${API_ENDPOINTS.BOOKS.LIST}/${bookId}/unpublish`);
  },

  deleteBook: async (bookId: number): Promise<void> => {
    await apiClient.delete(`${API_ENDPOINTS.BOOKS.LIST}/${bookId}`);
  },
};

export default bookService;
