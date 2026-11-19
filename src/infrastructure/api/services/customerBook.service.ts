import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Book, CustomerBookOverview, CustomerChapter, GetCustomerBooksParams, PaginatedResponse } from '@/src/shared/types';

// Dùng chung request overview đang chạy (kể cả lần chạy lại effect của React Strict Mode).
// Xóa request khi đã xong để lần thử lại hoặc mở lại luôn đọc dữ liệu mới.
const overviewRequests = new Map<number, Promise<CustomerBookOverview>>();

const getOverview = (bookId: number): Promise<CustomerBookOverview> => {
  const pending = overviewRequests.get(bookId);
  if (pending) return pending;
  const request = apiClient
    .get(API_ENDPOINTS.BOOKS.OVERVIEW(bookId))
    .then((response) => unwrap<CustomerBookOverview>(response));
  overviewRequests.set(bookId, request);
  const release = () => {
    if (overviewRequests.get(bookId) === request) overviewRequests.delete(bookId);
  };
  void request.then(release, release);
  return request;
};

/**
 * Các endpoint công khai của BookController dành cho khách hàng (catalog, overview, sách liên quan,
 * danh sách chương); phần quản lý của admin nằm ở bookService và chapterService.
 */
export const customerBookService = {
  getBooks: async (params?: GetCustomerBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.CATALOG, { params })),

  getBooksByCategory: async (
    categoryId: number,
    params?: Pick<GetCustomerBooksParams, 'page' | 'size'>
  ): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.CATALOG, { params: { ...params, categoryId } })),

  getOverview,

  /** Sách liên quan, backend trả thẳng danh sách thẻ sách theo thứ tự đã xếp. */
  getRelatedBooks: async (bookId: number, limit = 8): Promise<Book[]> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.RECOMMENDATIONS(bookId), { params: { limit } })),

  /** Toàn bộ chương của sách (GET /books/{bookId}/chapters/list). */
  getChapters: async (bookId: number): Promise<CustomerChapter[]> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.CHAPTER_LIST(bookId))),
};
