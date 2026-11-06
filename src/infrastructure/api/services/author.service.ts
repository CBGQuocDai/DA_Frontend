import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Author, CustomerAuthorSort, CustomerAuthorSummary, PaginatedResponse } from '@/src/shared/types';

export interface GetCustomerAuthorsParams {
  keyword?: string;
  sort?: CustomerAuthorSort;
  page?: number;
  size?: number;
}

export const authorService = {
  getAuthors: async (): Promise<Author[]> =>
    unwrap<Author[]>(await apiClient.get(API_ENDPOINTS.AUTHORS)) ?? [],

  getCustomerPage: async (params: GetCustomerAuthorsParams = {}): Promise<PaginatedResponse<CustomerAuthorSummary>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_AUTHORS.PAGE, { params })),

  getCustomerById: async (authorId: number): Promise<CustomerAuthorSummary> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_AUTHORS.DETAIL(authorId))),
};
