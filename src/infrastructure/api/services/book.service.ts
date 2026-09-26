import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Book, BookDetail, Category, SearchParams, PaginatedResponse } from '@/src/shared/types';

export const bookService = {
  getBooks: async (params?: SearchParams): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<PaginatedResponse<Book>>(
      API_ENDPOINTS.BOOKS.LIST,
      { params }
    );
    return response.data;
  },

  getBookById: async (id: string): Promise<BookDetail> => {
    const response = await apiClient.get<BookDetail>(API_ENDPOINTS.BOOKS.DETAIL(id));
    return response.data;
  },

  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(API_ENDPOINTS.BOOKS.CATEGORIES);
    return response.data;
  },

  searchBooks: async (keyword: string): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(API_ENDPOINTS.BOOKS.SEARCH, {
      params: { keyword },
    });
    return response.data;
  },

  getFeaturedBooks: async (): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(API_ENDPOINTS.BOOKS.FEATURED);
    return response.data;
  },

  getNewestBooks: async (): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(API_ENDPOINTS.BOOKS.NEWEST);
    return response.data;
  },
};

export default bookService;
