import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Author } from '@/src/shared/types';

export const authorService = {
  getAuthors: async (): Promise<Author[]> =>
    unwrap<Author[]>(await apiClient.get(API_ENDPOINTS.AUTHORS)) ?? [],
};
