import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Author, PaginatedResponse } from '@/src/shared/types';
import { toSearchQuery, type SearchParams } from './search.params';

/**
 * Body of both create (POST) and update (PUT, full replacement). `avatar` is the
 * path returned by uploadService for a new image, the current path to keep it,
 * or empty to remove it.
 */
export interface AuthorPayload {
  fullName: string;
  bio?: string;
  avatar?: string;
}

export const authorService = {
  /** Every author, for pickers. */
  getAuthors: async (): Promise<Author[]> =>
    unwrap<Author[]>(await apiClient.get(API_ENDPOINTS.AUTHORS.LIST)) ?? [],

  /** Admin list, filtered by name, newest first. */
  searchAuthors: async (params: SearchParams): Promise<PaginatedResponse<Author>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.AUTHORS.SEARCH, { params: toSearchQuery(params) })),

  createAuthor: async (payload: AuthorPayload): Promise<Author> =>
    unwrap(await apiClient.post(API_ENDPOINTS.AUTHORS.LIST, payload)),

  updateAuthor: async (authorId: number, payload: AuthorPayload): Promise<Author> =>
    unwrap(await apiClient.put(API_ENDPOINTS.AUTHORS.DETAIL(authorId), payload)),

  deleteAuthor: async (authorId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.AUTHORS.DETAIL(authorId));
  },
};
