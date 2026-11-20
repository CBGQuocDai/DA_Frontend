import { API_BASE_URL, API_ENDPOINTS, STORAGE_KEYS } from '@/src/shared/constants';
import { storageString } from '@/src/shared/utils';
import type { BookStatus, ChapterStatus } from '@/src/shared/types';
import { createSseParser } from './sseParser';

interface BookStatusEvent {
  bookId: number;
  status: BookStatus;
}

interface ChapterStatusEvent {
  bookId: number;
  chapterId: number;
  status: ChapterStatus;
  audioUrl: string | null;
  duration: number | null;
}

export interface AdminEventHandlers {
  /** OCR kết thúc: sách chuyển sang UNPUBLISHED hoặc FAILED */
  onBookStatus?: (event: BookStatusEvent) => void;
  /** Gen audio kết thúc: chương chuyển sang AUDIO_READY hoặc FAILED */
  onChapterStatus?: (event: ChapterStatusEvent) => void;
  /** Nối lại được sau khi rớt: event trong lúc mất kết nối không được phát lại nên cần tải lại dữ liệu */
  onReconnect?: () => void;
}

const INITIAL_RETRY_MS = 1000;
const MAX_RETRY_MS = 30000;

/**
 * Mở stream SSE của admin. Dùng fetch thay cho EventSource vì EventSource không gắn được
 * header Authorization, mà token không được phép nằm trên URL. Trả về hàm ngắt kết nối.
 */
export const connectAdminEvents = (handlers: AdminEventHandlers): (() => void) => {
  const controller = new AbortController();
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retryDelay = INITIAL_RETRY_MS;
  let connectedBefore = false;

  const dispatch = (event: string, data: string) => {
    try {
      if (event === 'book-status') handlers.onBookStatus?.(JSON.parse(data));
      else if (event === 'chapter-status') handlers.onChapterStatus?.(JSON.parse(data));
    } catch (error) {
      console.error('Error handling admin event:', event, error);
    }
  };

  /** Trả về false khi không nên thử lại (chưa đăng nhập hoặc token bị từ chối). */
  const readStream = async (): Promise<boolean> => {
    const token = storageString.get(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) return false;

    const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.EVENTS}`, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'text/event-stream' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (response.status === 401 || response.status === 403) return false;
    if (!response.ok || !response.body) throw new Error(`Admin events responded ${response.status}`);

    retryDelay = INITIAL_RETRY_MS;
    if (connectedBefore) handlers.onReconnect?.();
    connectedBefore = true;

    const parse = createSseParser();
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) return true;
      for (const message of parse(value)) dispatch(message.event, message.data);
    }
  };

  const run = async () => {
    let retry = true;
    try {
      retry = await readStream();
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn('Admin event stream interrupted:', error);
    }
    if (!retry || controller.signal.aborted) return;
    retryTimer = setTimeout(run, retryDelay);
    retryDelay = Math.min(retryDelay * 2, MAX_RETRY_MS);
  };

  run();

  return () => {
    controller.abort();
    clearTimeout(retryTimer);
  };
};
