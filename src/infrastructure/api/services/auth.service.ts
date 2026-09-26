import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import { storage, storageString } from '@/src/shared/utils';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/src/shared/types';

export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const { accessToken, refreshToken, user } = response.data;
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.set(STORAGE_KEYS.USER, user);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    const { accessToken, refreshToken, user } = response.data;
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.set(STORAGE_KEYS.USER, user);
    return response.data;
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    }
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    storage.set(STORAGE_KEYS.USER, response.data);
    return response.data;
  },

  isAuthenticated: (): boolean => {
    return storageString.get(STORAGE_KEYS.ACCESS_TOKEN) !== null;
  },

  getStoredUser: (): User | null => {
    return storage.get<User>(STORAGE_KEYS.USER);
  },

  clearAuth: (): void => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
    storage.remove(STORAGE_KEYS.USER);
  },
};

export default authService;
