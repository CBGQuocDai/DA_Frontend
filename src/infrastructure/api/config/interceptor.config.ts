import { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ROUTES, STORAGE_KEYS } from '@/src/shared/constants';
import { storageString } from '@/src/shared/utils';

const getAccessToken = (): string | null => storageString.get(STORAGE_KEYS.ACCESS_TOKEN);

/**
 * Trang admin không dùng được khi chưa đăng nhập nên đưa về trang login thay vì để mở và
 * tiếp tục gửi request ẩn danh. Trang login tự xử lý lỗi 401 (sai mật khẩu); trang khách hàng
 * vẫn xem được khi chưa đăng nhập. Điều hướng cả trang để cảnh báo beforeunload của trình soạn
 * chương kịp giữ lại nội dung chưa lưu.
 */
const redirectAdminToLogin = (): void => {
  if (typeof window === 'undefined') return;
  const { pathname } = window.location;
  if (pathname.startsWith('/admin') && pathname !== ROUTES.ADMIN.LOGIN) {
    window.location.assign(ROUTES.ADMIN.LOGIN);
  }
};

/** Gắn interceptor xác thực cho axios instance. */
export const setupInterceptors = (axiosInstance: AxiosInstance): AxiosInstance => {
  // Request: tự đính kèm Bearer token, trừ khi request đã tự đặt header Authorization
  axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Response: 401 nghĩa là token hết hạn hoặc đã bị thu hồi nên xóa phiên ở client
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        const token = getAccessToken();
        // 401 của phiên cũ (vd: request đăng xuất về muộn) không được xóa phiên vừa đăng nhập lại
        if (!token || error.config?.headers?.Authorization === `Bearer ${token}`) {
          storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
          redirectAdminToLogin();
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};
