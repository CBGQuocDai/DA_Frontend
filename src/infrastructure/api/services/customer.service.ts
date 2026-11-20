import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type {
  AuthResponse,
  ChangePasswordRequest,
  CustomerProfile,
  LoginRequest,
  RegisterRequest,
} from '@/src/shared/types';
import { authService } from './auth.service';

/** Các API tài khoản khách hàng (CustomerController). */
export const customerService = {
  /** Đăng nhập khách hàng (POST /customer/login) và lưu access token. */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const session = unwrap<AuthResponse>(await apiClient.post(API_ENDPOINTS.CUSTOMER.LOGIN, credentials));
    authService.storeAccessToken(session.accessToken);
    return session;
  },

  /** Đăng ký (POST /customer/register); backend đặt tên trường là `fullname` (RegisterRequest). */
  register: async ({ email, password, fullName }: RegisterRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CUSTOMER.REGISTER, { email, password, fullname: fullName });
  },

  getProfile: async (): Promise<CustomerProfile> =>
    unwrap(await apiClient.get(API_ENDPOINTS.CUSTOMER.PROFILE)),

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
