import { apiClient } from '../config/apiClient';
import type { ApiResponse, PaginatedResponse } from '@/src/shared/types';
import type { Category } from '@/src/shared/types';

export const categoryService = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get<any>('/categories');
    return response.data?.data ?? response.data ?? [];
  },
};

export default categoryService;
