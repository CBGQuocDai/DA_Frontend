import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { ChangePasswordRequest } from '@/src/shared/types';

/**
 * Các API dùng chung cho mọi loại tài khoản (AuthController).
 * Đăng nhập/đăng ký nằm ở adminService và customerService, theo đúng controller phía backend.
 */
export const authService = {
  /**
   * Đổi mật khẩu của tài khoản đang đăng nhập (POST /auth/change-password). Backend từ chối khi
   * mật khẩu hiện tại sai hoặc mật khẩu mới trùng mật khẩu cũ.
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /** Thu hồi đúng token đã chụp trước khi xóa phiên ở client. */
  logout: async (accessToken: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT, null, { headers: { Authorization: `Bearer ${accessToken}` } });
  },
};
