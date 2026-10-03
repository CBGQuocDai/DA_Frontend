import { apiClient } from '../config/apiClient';
import type { Author } from '@/src/shared/types';

export const authorService = {
  getAuthors: async (): Promise<Author[]> => {
    const response = await apiClient.get<any>('/authors');
    return response.data?.data ?? response.data ?? [];
  },
};

export default authorService;
