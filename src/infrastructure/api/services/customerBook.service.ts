import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Book, CustomerBookOverview, CustomerChapter, GetCustomerBooksParams, PaginatedResponse } from '@/src/shared/types';

/**
 * Các endpoint công khai của BookController dành cho khách hàng (catalog, overview, danh sách chương);
 * phần quản lý của admin nằm ở bookService và chapterService.
 */
export const customerBookService = {
  getBooks: async (params?: GetCustomerBooksParams): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.CATALOG, { params })),

  getBooksByCategory: async (
    categoryId: number,
    params?: Pick<GetCustomerBooksParams, 'page' | 'size'>
  ): Promise<PaginatedResponse<Book>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.CATALOG, { params: { ...params, categoryId } })),

  getOverview: async (bookId: number): Promise<CustomerBookOverview> =>
    unwrap(await apiClient.get(API_ENDPOINTS.BOOKS.OVERVIEW(bookId))),

  /**
   * Backend trả toàn bộ chương trong một lần gọi (GET /books/{bookId}/chapters/list),
   * nên việc chia trang được làm ở client.
   */
  getChaptersPage: async (bookId: number, page = 0, size = 10): Promise<PaginatedResponse<CustomerChapter>> => {
    const chapters =
      unwrap<CustomerChapter[]>(await apiClient.get(API_ENDPOINTS.BOOKS.CHAPTER_LIST(bookId))) ?? [];
    return {
      content: chapters.slice(page * size, (page + 1) * size),
      total: chapters.length,
      totalPage: Math.ceil(chapters.length / size),
      page,
      pageSize: size,
    };
  },
};
