import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ChangePasswordRequest,
  User,
} from '@/src/shared/types';
import { storage, storageString } from '@/src/shared/utils';

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LoginData {
  accessToken: string;
}

function parseJwt(token: string): { sub: string; email?: string } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export const authService = {
  /**
   * Login with email and password (supports both Customer and Admin)
   */
  login: async (
    credentials: LoginRequest,
    preferredRole?: 'ADMIN' | 'CUSTOMER'
  ): Promise<AuthResponse> => {
    let accessToken = '';
    let role: 'ADMIN' | 'CUSTOMER' = preferredRole || 'CUSTOMER';

    if (preferredRole === 'ADMIN') {
      const response = await apiClient.post<ApiResponse<LoginData>>(
        API_ENDPOINTS.AUTH.ADMIN_LOGIN,
        credentials
      );
      accessToken = response.data?.data?.accessToken;
      role = 'ADMIN';
    } else if (preferredRole === 'CUSTOMER') {
      const response = await apiClient.post<ApiResponse<LoginData>>(
        API_ENDPOINTS.AUTH.CUSTOMER_LOGIN,
        credentials
      );
      accessToken = response.data?.data?.accessToken;
      role = 'CUSTOMER';
    } else {
      // Tự động nhận diện: thử Customer trước, nếu không thành công thì thử Admin
      try {
        const response = await apiClient.post<ApiResponse<LoginData>>(
          API_ENDPOINTS.AUTH.CUSTOMER_LOGIN,
          credentials
        );
        accessToken = response.data?.data?.accessToken;
        role = 'CUSTOMER';
      } catch (err: unknown) {
        interface AxiosErr {
          response?: { status?: number; data?: { code?: number } };
        }
        const axiosErr = err as AxiosErr;
        if (
          axiosErr.response?.status === 400 ||
          axiosErr.response?.data?.code === 4003
        ) {
          const adminResponse = await apiClient.post<ApiResponse<LoginData>>(
            API_ENDPOINTS.AUTH.ADMIN_LOGIN,
            credentials
          );
          accessToken = adminResponse.data?.data?.accessToken;
          role = 'ADMIN';
        } else {
          throw err;
        }
      }
    }

    if (!accessToken) {
      throw new Error('Không nhận được mã xác thực từ máy chủ');
    }

    const decoded = parseJwt(accessToken);
    const user: User = {
      id: decoded?.sub || '1',
      email: decoded?.email || credentials.email,
      fullName: role === 'ADMIN' ? 'Quản trị viên' : 'Khách hàng',
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Nếu là Customer, lấy thêm profile từ Backend nếu có
    if (role === 'CUSTOMER') {
      try {
        const profileRes = await apiClient.get<ApiResponse<any>>(
          API_ENDPOINTS.AUTH.CUSTOMER_PROFILE,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (profileRes.data?.data) {
          const profile = profileRes.data.data;
          user.id = String(profile.id || user.id);
          user.fullName = profile.fullName || user.fullName;
          user.avatar = profile.avatarUrl || user.avatar;
        }
      } catch {
        // Profile fetch optional
      }
    }

    // Store tokens
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageString.set(STORAGE_KEYS.REFRESH_TOKEN, '');
    storage.set(STORAGE_KEYS.USER, user);

    return {
      accessToken,
      refreshToken: '',
      user,
    };
  },

  /**
   * Register new user
   */
  register: async (
    data: RegisterRequest,
    role: 'ADMIN' | 'CUSTOMER' = 'CUSTOMER'
  ): Promise<AuthResponse> => {
    const endpoint =
      role === 'ADMIN'
        ? API_ENDPOINTS.AUTH.ADMIN_REGISTER
        : API_ENDPOINTS.AUTH.CUSTOMER_REGISTER;

    await apiClient.post(endpoint, {
      email: data.email,
      password: data.password,
      fullname: data.fullName,
    });

    return authService.login(
      { email: data.email, password: data.password },
      role
    );
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const stored = authService.getStoredUser();
    if (!stored) {
      throw new Error('Chưa đăng nhập');
    }

    if (stored.role === 'CUSTOMER') {
      try {
        const profileRes = await apiClient.get<ApiResponse<any>>(
          API_ENDPOINTS.AUTH.CUSTOMER_PROFILE
        );
        if (profileRes.data?.data) {
          const profile = profileRes.data.data;
          const updatedUser: User = {
            ...stored,
            id: String(profile.id || stored.id),
            fullName: profile.fullName || stored.fullName,
            avatar: profile.avatarUrl || stored.avatar,
          };
          storage.set(STORAGE_KEYS.USER, updatedUser);
          return updatedUser;
        }
      } catch {
        return stored;
      }
    }

    return stored;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
      oldPassword: data.oldPassword,
      newPassword: data.newPassword,
    });
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return storageString.get(STORAGE_KEYS.ACCESS_TOKEN) !== null;
  },

  /**
   * Get stored user
   */
  getStoredUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  /**
   * Clear auth data (for forced logout)
   */
  clearAuth: (): void => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },
};

export default authService;
