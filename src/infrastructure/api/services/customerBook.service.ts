import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Book, CustomerBookOverview, CustomerChapter, PaginatedResponse } from '@/src/shared/types';

export interface GetCustomerBooksParams {
  page?: number;
  size?: number;
  bookName?: string;
  categoryId?: number;
  authorId?: number;
}

/** Separate customer reads; the admin API still returns the full editable chapter list. */
export const customerBookService = {
  getBooks: async (params?: GetCustomerBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.LIST, { params })),

  getBooksByCategory: async (
    categoryId: number,
    params?: Pick<GetCustomerBooksParams, 'page' | 'size'>
  ): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.LIST, { params: { ...params, categoryId } })),

  getOverview: async (bookId: number): Promise<CustomerBookOverview> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.OVERVIEW(bookId))),

  getChaptersPage: async (bookId: number, page = 0, size = 10): Promise<PaginatedResponse<CustomerChapter>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.CHAPTERS(bookId), { params: { page, size } })),

  checkOwnership: async (bookId: number): Promise<boolean> => {
    const data = unwrap<{ purchased?: boolean } | null>(
      await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.CHECK_OWNERSHIP(bookId))
    );
    return Boolean(data?.purchased);
  },
};
