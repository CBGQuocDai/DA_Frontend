import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ROUTES, STORAGE_KEYS } from '@/src/shared/constants';
import { storageString } from '@/src/shared/utils';

/**
 * Hàm lấy Access Token từ Storage an toàn cho cả môi trường Next.js SSR và Client.
 */
export const getAccessToken = (): string | null => {
  return storageString.get(STORAGE_KEYS.ACCESS_TOKEN);
};

/**
 * Admin pages can't work without a session, so don't leave them open sending anonymous requests.
 * The login page keeps its own 401 (wrong password); customer pages stay browsable.
 * A full navigation lets the book editor's beforeunload warning protect unsaved text.
 */
const redirectAdminToLogin = (): void => {
  if (typeof window === 'undefined') return;
  const { pathname } = window.location;
  if (pathname.startsWith('/admin') && pathname !== ROUTES.ADMIN.LOGIN) {
    window.location.assign(ROUTES.ADMIN.LOGIN);
  }
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
        redirectAdminToLogin();
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
