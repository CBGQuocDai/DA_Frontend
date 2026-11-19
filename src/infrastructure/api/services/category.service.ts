import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { BestsellerPeriod, Category, CategoryPayload, PaginatedResponse, SearchParams } from '@/src/shared/types';
import { toSearchQuery } from './search.params';

/** Các API thể loại (CategoryController). */
export const categoryService = {
  /** Toàn bộ thể loại, dùng cho tab cửa hàng và các ô chọn. */
  getCategories: async (): Promise<Category[]> =>
    unwrap<Category[]>(await apiClient.get(API_ENDPOINTS.CATEGORIES.ROOT)) ?? [],

  /** Danh sách cho trang quản lý: lọc theo tên hoặc mô tả, mới nhất trước. */
  searchCategories: async (params: SearchParams): Promise<PaginatedResponse<Category>> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CATEGORIES.SEARCH, { params: toSearchQuery(params) })),

  /** Thể loại bán chạy trong kỳ, kèm `purchases` và `previousPurchases` để so với kỳ trước. */
  getBestsellers: async (period: BestsellerPeriod): Promise<Category[]> =>
    unwrap<Category[]>(await apiClient.get(API_ENDPOINTS.CATEGORIES.BESTSELLERS, { params: { period } })) ?? [],

  createCategory: async (payload: CategoryPayload): Promise<Category> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CATEGORIES.ROOT, payload)),

  updateCategory: async (categoryId: number, payload: CategoryPayload): Promise<Category> =>
    unwrap(await apiClient.put(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId), payload)),

  deleteCategory: async (categoryId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CATEGORIES.DETAIL(categoryId));
  },
};
