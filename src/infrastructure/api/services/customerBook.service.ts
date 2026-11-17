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

// Share overlapping public overview reads (including React Strict Mode's effect replay).
// Remove each request when it settles so retrying or reopening always reads fresh data.
const overviewRequests = new Map<number, Promise<CustomerBookOverview>>();

const getOverview = (bookId: number): Promise<CustomerBookOverview> => {
  const pending = overviewRequests.get(bookId);
  if (pending) return pending;
  const request = apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.OVERVIEW(bookId))
    .then((response) => unwrap<CustomerBookOverview>(response));
  overviewRequests.set(bookId, request);
  const release = () => {
    if (overviewRequests.get(bookId) === request) overviewRequests.delete(bookId);
  };
  void request.then(release, release);
  return request;
};

/** Separate customer reads; the admin API still returns the full editable chapter list. */
export const customerBookService = {
  getBooks: async (params?: GetCustomerBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.LIST, { params })),

  getOverview,

  /** Public discovery shelf, available without a customer session. */
  getRecommendations: async (limit = 10): Promise<Book[]> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.RECOMMENDATIONS, { params: { limit } })),

  /** Public recommendations return book cards directly in data, in backend order. */
  getRelatedBooks: async (bookId: number, limit = 8): Promise<Book[]> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.RELATED(bookId), { params: { limit } })),

  getChapters: async (bookId: number): Promise<CustomerChapter[]> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.CHAPTERS(bookId))),

  checkOwnership: async (bookId: number): Promise<boolean> => {
    const data = unwrap<{ purchased?: boolean } | null>(
      await apiClient.get(API_ENDPOINTS.CUSTOMER_BOOKS.CHECK_OWNERSHIP(bookId))
    );
    return Boolean(data?.purchased);
  },
};
