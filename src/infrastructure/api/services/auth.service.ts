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

export const authService = {
  /**
   * Login with email and password
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.set(STORAGE_KEYS.USER, user);

    return response.data;
  },

  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    );
    const { accessToken, refreshToken, user } = response.data;

    // Store tokens
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    storage.set(STORAGE_KEYS.USER, user);

    return response.data;
  },

  /**
   * Logout current user
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    } finally {
      // Clear local storage regardless of API result
      storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
      storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
      storage.remove(STORAGE_KEYS.USER);
    }
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<User>(API_ENDPOINTS.AUTH.ME);
    storage.set(STORAGE_KEYS.USER, response.data);
    return response.data;
  },

  /**
   * Change password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
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
   * Refresh access token
   */
  refreshToken: async (): Promise<string> => {
    const refreshToken = storageString.get(STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ accessToken: string }>(
      API_ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken }
    );

    const { accessToken } = response.data;
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    return accessToken;
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
