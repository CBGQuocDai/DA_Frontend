import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { BestsellerPeriod, Category, PaginatedResponse } from '@/src/shared/types';
import { toSearchQuery, type SearchParams } from './search.params';

/** Body of both create (POST) and update (PUT, full replacement). */
export interface CategoryPayload {
  name: string;
  description?: string;
}

export const categoryService = {
  /** Admin dashboard: categories by purchases in the period, with `purchases` and `previousPurchases`. */
  getBestsellers: async (period: BestsellerPeriod): Promise<Category[]> =>
    unwrap<Category[]>(await apiClient.get(API_ENDPOINTS.CATEGORIES.BESTSELLERS, { params: { period } })) ?? [],

  /** Every category, for the store tabs and pickers. */
  getCategories: async (): Promise<Category[]> =>
    unwrap<Category[]>(await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST)) ?? [],

  /** Admin list, filtered by name or description, newest first. */
  searchCategories: async (params: SearchParams): Promise<PaginatedResponse<Category>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CATEGORIES.SEARCH, { params: toSearchQuery(params) })),

  createCategory: async (payload: CategoryPayload): Promise<Category> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CATEGORIES.LIST, payload)),

  updateCategory: async (categoryId: number, payload: CategoryPayload): Promise<Category> =>
    unwrap(await apiClient.put(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId), payload)),

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },
};
