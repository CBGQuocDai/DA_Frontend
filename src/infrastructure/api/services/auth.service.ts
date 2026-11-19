import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import type { ChangePasswordRequest, User } from '@/src/shared/types';
import { storageJson, storageString } from '@/src/shared/utils';

/**
 * Các API dùng chung cho mọi loại tài khoản (AuthController) và phiên đăng nhập lưu ở client.
 * Đăng nhập/đăng ký nằm ở adminService và customerService, theo đúng controller phía backend.
 */
export const authService = {
  /** Lưu access token sau khi đăng nhập; interceptor sẽ tự đính kèm vào các request sau. */
  storeAccessToken: (accessToken: string): void => storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken),

  storeUser: (user: User): void => storageJson.set(STORAGE_KEYS.USER, user),

  /**
   * Đổi mật khẩu của tài khoản đang đăng nhập (POST /auth/change-password). Backend từ chối khi
   * mật khẩu hiện tại sai hoặc mật khẩu mới trùng mật khẩu cũ.
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  /**
   * Xóa phiên ở client ngay rồi mới báo backend thu hồi token (POST /auth/logout), nên giao
   * diện không phải chờ mạng. Token được gửi kèm thủ công vì lúc này đã bị xóa khỏi storage.
   */
  logout: (): void => {
    const token = storageString.get(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageJson.remove(STORAGE_KEYS.USER);
    if (!token) return;
    apiClient
      .post(API_ENDPOINTS.AUTH.LOGOUT, null, { headers: { Authorization: `Bearer ${token}` } })
      // Phiên ở client đã xóa; nếu lỗi thì token tự hết hạn
      .catch(() => undefined);
  },
};
