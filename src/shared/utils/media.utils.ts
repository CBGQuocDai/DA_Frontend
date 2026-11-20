import { API_BASE_URL } from '@/src/shared/constants';

const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Đổi đường dẫn media tương đối của backend (audio, ảnh...) thành URL tuyệt đối. */
export const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};
