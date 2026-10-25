import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import type {
  ApiResponse,
  LoginRequest,
  AuthResponse,
  RegisterRequest,
  ChangePasswordRequest,
  CustomerProfile,
  User,
} from '@/src/shared/types';
import { storageJson, storageString } from '@/src/shared/utils';

export const authService = {
  login: async (credentials: LoginRequest, admin = false): Promise<AuthResponse> => {
    const endpoint = admin ? API_ENDPOINTS.AUTH.ADMIN_LOGIN : API_ENDPOINTS.AUTH.CUSTOMER_LOGIN;
    const response = await apiClient.post<ApiResponse<AuthResponse>>(endpoint, credentials);
    const { accessToken, refreshToken } = response.data.data;
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    return response.data.data;
  },

  register: async ({ email, password, fullName }: RegisterRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CUSTOMER_REGISTER, {
      email,
      password,
      fullname: fullName,
    });
  },

  getCustomerProfile: async (): Promise<CustomerProfile> => {
    const response = await apiClient.get<ApiResponse<CustomerProfile>>(
      API_ENDPOINTS.AUTH.CUSTOMER_PROFILE
    );
    return response.data.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
  },

  isAuthenticated: (): boolean => storageString.get(STORAGE_KEYS.ACCESS_TOKEN) !== null,

  getStoredUser: (): User | null => storageJson.get<User>(STORAGE_KEYS.USER),

  storeUser: (user: User): void => storageJson.set(STORAGE_KEYS.USER, user),

  logout: (): void => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storageJson.remove(STORAGE_KEYS.USER);
  },
};
