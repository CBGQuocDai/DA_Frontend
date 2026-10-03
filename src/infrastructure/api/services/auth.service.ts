import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import type { ApiResponse, LoginRequest, AuthResponse } from '@/src/shared/types';
import { storageString } from '@/src/shared/utils';

export const authService = {
  login: async (credentials: LoginRequest, admin = false): Promise<AuthResponse> => {
    const endpoint = admin ? API_ENDPOINTS.AUTH.ADMIN_LOGIN : API_ENDPOINTS.AUTH.CUSTOMER_LOGIN;
    const response = await apiClient.post<ApiResponse<AuthResponse>>(endpoint, credentials);
    const { accessToken, refreshToken } = response.data.data;
    storageString.set(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) storageString.set(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    return response.data.data;
  },

  logout: (): void => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.REFRESH_TOKEN);
  },
};

export default authService;
