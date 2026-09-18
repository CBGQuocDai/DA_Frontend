import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  Book,
  BookDetail,
  CreateBookRequest,
  UpdateBookRequest,
  SearchParams,
  PaginatedResponse,
  Category,
} from '@/src/shared/types';

export const bookService = {
  /**
   * Get paginated list of books
   */
  getBooks: async (params?: SearchParams): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<PaginatedResponse<Book>>(
      API_ENDPOINTS.BOOKS.LIST,
      { params }
    );
    return response.data;
  },

  /**
   * Get single book detail
   */
  getBookById: async (id: string): Promise<BookDetail> => {
    const response = await apiClient.get<BookDetail>(
      API_ENDPOINTS.BOOKS.DETAIL(id)
    );
    return response.data;
  },

  /**
   * Search books
   */
  searchBooks: async (
    params: SearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<PaginatedResponse<Book>>(
      API_ENDPOINTS.BOOKS.SEARCH,
      { params }
    );
    return response.data;
  },

  /**
   * Get featured books
   */
  getFeaturedBooks: async (limit = 10): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(
      API_ENDPOINTS.BOOKS.FEATURED,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get newest books
   */
  getNewestBooks: async (limit = 10): Promise<Book[]> => {
    const response = await apiClient.get<Book[]>(
      API_ENDPOINTS.BOOKS.NEWEST,
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get books by category
   */
  getBooksByCategory: async (
    categoryId: string,
    params?: SearchParams
  ): Promise<PaginatedResponse<Book>> => {
    const response = await apiClient.get<PaginatedResponse<Book>>(
      `${API_ENDPOINTS.BOOKS.LIST}/category/${categoryId}`,
      { params }
    );
    return response.data;
  },

  // ===== Admin Methods =====

  /**
   * Create new book (Admin)
   */
  createBook: async (data: CreateBookRequest): Promise<Book> => {
    const response = await apiClient.post<Book>(
      API_ENDPOINTS.BOOKS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update book (Admin)
   */
  updateBook: async (data: UpdateBookRequest): Promise<Book> => {
    const response = await apiClient.put<Book>(
      API_ENDPOINTS.BOOKS.UPDATE(data.id),
      data
    );
    return response.data;
  },

  /**
   * Delete book (Admin)
   */
  deleteBook: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKS.DELETE(id));
  },

  /**
   * Get all categories
   */
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<Category[]>(
      API_ENDPOINTS.CATEGORIES.LIST
    );
    return response.data;
  },

  /**
   * Create category (Admin)
   */
  createCategory: async (data: {
    name: string;
    slug?: string;
    icon?: string;
  }): Promise<Category> => {
    const response = await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update category (Admin)
   */
  updateCategory: async (
    id: string,
    data: { name?: string; slug?: string; icon?: string }
  ): Promise<Category> => {
    const response = await apiClient.put<Category>(
      API_ENDPOINTS.CATEGORIES.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete category (Admin)
   */
  deleteCategory: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DELETE(id));
  },
};

export default bookService;
