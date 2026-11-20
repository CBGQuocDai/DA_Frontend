import { API_BASE_URL, API_ENDPOINTS } from '@/src/shared/constants';
import type { BookProgress, SaveListeningProgress } from '@/src/shared/types';

class ListeningProgressError extends Error {
  constructor(public readonly status: number) {
    super(`Listening progress: HTTP ${status}`);
  }
}

/** Bind outgoing requests to the original account, including saves finishing after navigation. */
export const createListeningProgressApi = (bookId: number, token: string) => {
  const request = async (path: string, body?: SaveListeningProgress): Promise<BookProgress> => {
    const response = await fetch(`${API_BASE_URL.replace(/\/$/, '')}${path}`, {
      method: body ? 'PUT' : 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      cache: 'no-store',
      signal: AbortSignal.timeout(10_000),
      // Periodic saves are primary; keepalive also helps small writes finish when leaving the page.
      keepalive: Boolean(body),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) throw new ListeningProgressError(response.status);
    const result = await response.json() as { data: BookProgress };
    return result.data;
  };
  return {
    load: () => request(API_ENDPOINTS.CUSTOMER.LISTENING_PROGRESS(bookId)),
    save: (chapterId: number, body: SaveListeningProgress) =>
      request(API_ENDPOINTS.CUSTOMER.SAVE_LISTENING_PROGRESS(bookId, chapterId), body),
  };
};
