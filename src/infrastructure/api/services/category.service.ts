import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Category } from '@/src/shared/types';

export const categoryService = {
  getCategories: async (): Promise<Category[]> =>
    unwrap<Category[]>(await apiClient.get(API_ENDPOINTS.CATEGORIES)) ?? [],
};
