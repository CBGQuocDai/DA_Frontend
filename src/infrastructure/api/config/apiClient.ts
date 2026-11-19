import axios from 'axios';
import { API_BASE_URL } from '@/src/shared/constants';
import { setupInterceptors } from './interceptor.config';

/** Axios instance dùng chung cho mọi service: đã gắn baseURL và interceptor xác thực. */
export const apiClient = setupInterceptors(
  axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })
);

/**
 * Lấy phần dữ liệu trong response. Hầu hết endpoint bọc kết quả dạng
 * `{ code, message, data }` (ApiResponse phía backend); một vài endpoint trả thẳng dữ liệu.
 */
export const unwrap = <T>({ data: body }: { data: unknown }): T =>
  ((body as { data?: T } | undefined)?.data ?? body) as T;
