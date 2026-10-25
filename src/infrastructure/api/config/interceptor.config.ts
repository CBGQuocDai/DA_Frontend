import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { STORAGE_KEYS } from '@/src/shared/constants';
import { storageString } from '@/src/shared/utils';

/**
 * Hàm lấy Access Token từ Storage an toàn cho cả môi trường Next.js SSR và Client.
 */
export const getAccessToken = (): string | null => {
  return storageString.get(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Cấu hình Interceptor cho Axios Instance
 */
export const setupInterceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
  // 1. Request Interceptor: Tự động đính kèm Bearer Token vào Header
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();

      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // 2. Response Interceptor: Bắt các lỗi chung (VD: 401 Unauthorized khi token hết hạn)
  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
        // TODO: call refresh token or redirect to login
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
