import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { BestsellerPeriod, PurchaseTrend, Statistics } from '@/src/shared/types';

/** Dashboard figures that belong to no single book or category. */
export const statisticsService = {
  /** Overview and the monthly series; `months` is how far back the series reaches (1–24). */
  getStatistics: async (months: number): Promise<Statistics> =>
    unwrap(await apiClient.get(API_ENDPOINTS.STATISTICS.OVERVIEW, { params: { months } })),

  /** All purchases in the period against the period right before it. */
  getPurchaseTrend: async (period: BestsellerPeriod): Promise<PurchaseTrend> =>
    unwrap(await apiClient.get(API_ENDPOINTS.STATISTICS.PURCHASES, { params: { period } })),
};
