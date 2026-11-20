import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { AuthResponse, BestsellerPeriod, LoginRequest, PurchaseTrend, Statistics } from '@/src/shared/types';
import { authService } from './auth.service';

/** Các API riêng của admin (AdminController): đăng nhập và số liệu trang thống kê. */
export const adminService = {
  /** Đăng nhập quản trị (POST /admin/login) và lưu access token. */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const session = unwrap<AuthResponse>(await apiClient.post(API_ENDPOINTS.ADMIN.LOGIN, credentials));
    authService.storeAccessToken(session.accessToken);
    return session;
  },

  /** Số liệu tổng quan và chuỗi theo tháng; `months` là số tháng lùi về trước của chuỗi (1–24). */
  getStatistics: async (months: number): Promise<Statistics> =>
    unwrap(await apiClient.get(API_ENDPOINTS.ADMIN.STATISTICS, { params: { months } })),

  /** Tổng lượt mua trong kỳ so với kỳ liền trước. */
  getPurchaseTrend: async (period: BestsellerPeriod): Promise<PurchaseTrend> =>
    unwrap(await apiClient.get(API_ENDPOINTS.ADMIN.PURCHASE_TREND, { params: { period } })),
};
