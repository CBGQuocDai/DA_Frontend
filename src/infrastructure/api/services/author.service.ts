import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Author, AuthorPayload, PaginatedResponse, SearchParams } from '@/src/shared/types';
import { toSearchQuery } from './search.params';

/** Các API tác giả (AuthorController). */
export const authorService = {
  /** Toàn bộ tác giả, dùng cho các ô chọn. */
  getAuthors: async (): Promise<Author[]> =>
    unwrap<Author[]>(await apiClient.get(API_ENDPOINTS.AUTHORS.ROOT)) ?? [],

  getAuthor: async (authorId: number): Promise<Author> =>
    unwrap(await apiClient.get(API_ENDPOINTS.AUTHORS.DETAIL(authorId))),

  /** Danh sách có phân trang, lọc theo tên, mới nhất trước (công khai, dùng cho cả admin và khách). */
  searchAuthors: async (params: SearchParams): Promise<PaginatedResponse<Author>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.AUTHORS.SEARCH, { params: toSearchQuery(params) })),

  createAuthor: async (payload: AuthorPayload): Promise<Author> =>
    unwrap(await apiClient.post(API_ENDPOINTS.AUTHORS.ROOT, payload)),

  updateAuthor: async (authorId: number, payload: AuthorPayload): Promise<Author> =>
    unwrap(await apiClient.put(API_ENDPOINTS.AUTHORS.DETAIL(authorId), payload)),

  deleteAuthor: async (authorId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.AUTHORS.DETAIL(authorId));
  },
};
