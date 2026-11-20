import { apiClient, unwrap } from '../config/apiClient';
import type { AxiosRequestConfig } from 'axios';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type {
  AuthResponse,
  ChangePasswordRequest,
  CustomerProfileResponse,
  LoginRequest,
  RegisterRequest,
} from '@/src/shared/types';

/** Các API tài khoản khách hàng (CustomerController). */
export const customerService = {
  /** Chỉ gọi HTTP; use case quyết định có lưu phiên của lần đăng nhập này hay không. */
  login: async (credentials: LoginRequest): Promise<AuthResponse> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CUSTOMER.LOGIN, credentials)),

  /** Đăng ký (POST /customer/register); backend đặt tên trường là `fullname` (RegisterRequest). */
  register: async ({ email, password, fullName }: RegisterRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CUSTOMER.REGISTER, { email, password, fullname: fullName });
  },

  getProfile: async (config?: AxiosRequestConfig): Promise<CustomerProfileResponse> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER.PROFILE, config)),

  updateAvatar: async (avatarPath: string, config?: AxiosRequestConfig): Promise<CustomerProfileResponse> =>
    unwrap(await apiClient.put(API_ENDPOINTS.CUSTOMER.AVATAR, { avatarPath }, config)),

  /** Khách hàng đổi mật khẩu (POST /customer/profile/change-password). */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CUSTOMER.CHANGE_PASSWORD, data);
  },

  /** Khách hàng đang đăng nhập đã mua cuốn sách này chưa (GET /customer/books/{bookId}/check). */
  checkBookOwnership: async (bookId: number): Promise<boolean> => {
    const data = unwrap<{ purchased?: boolean } | null>(
      await apiClient.get(API_ENDPOINTS.CUSTOMER.BOOK_OWNERSHIP(bookId))
    );
    return Boolean(data?.purchased);
  },
};
