import { API_BASE_URL } from '@/src/shared/constants';

const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

/** Turns a backend-relative media path (audio, image...) into an absolute URL. */
export const resolveMediaUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BACKEND_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
};
