import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';

export const bookFavoriteService = {
  check: async (bookId: number): Promise<boolean> =>
    unwrap<boolean>(await apiClient.get(API_ENDPOINTS.BOOK_FAVORITES.CHECK(bookId))),

  toggle: async (bookId: number): Promise<boolean> => {
    const result = unwrap<{ isFavorite: boolean }>(
      await apiClient.post(API_ENDPOINTS.BOOK_FAVORITES.TOGGLE(bookId))
    );
    return result.isFavorite;
  },
};
