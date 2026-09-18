import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import {
  ListeningHistory,
  BookMark,
  CreateListeningHistoryRequest,
  CreateBookmarkRequest,
} from '@/src/shared/types';

export const listeningService = {
  /**
   * Get user's listening history
   */
  getHistory: async (): Promise<ListeningHistory[]> => {
    const response = await apiClient.get<ListeningHistory[]>(
      API_ENDPOINTS.LISTENING_HISTORY.LIST
    );
    return response.data;
  },

  /**
   * Get listening history for a specific book
   */
  getBookHistory: async (bookId: string): Promise<ListeningHistory | null> => {
    const response = await apiClient.get<ListeningHistory | null>(
      API_ENDPOINTS.LISTENING_HISTORY.BOOK(bookId)
    );
    return response.data;
  },

  /**
   * Update listening progress
   */
  updateProgress: async (
    data: CreateListeningHistoryRequest
  ): Promise<ListeningHistory> => {
    const response = await apiClient.post<ListeningHistory>(
      API_ENDPOINTS.LISTENING_HISTORY.UPSERT,
      data
    );
    return response.data;
  },

  /**
   * Get user's bookmarks
   */
  getBookmarks: async (): Promise<BookMark[]> => {
    const response = await apiClient.get<BookMark[]>(
      API_ENDPOINTS.BOOKMARKS.LIST
    );
    return response.data;
  },

  /**
   * Create a bookmark
   */
  createBookmark: async (data: CreateBookmarkRequest): Promise<BookMark> => {
    const response = await apiClient.post<BookMark>(
      API_ENDPOINTS.BOOKMARKS.CREATE,
      data
    );
    return response.data;
  },

  /**
   * Update a bookmark
   */
  updateBookmark: async (
    id: string,
    data: { note?: string; position?: number }
  ): Promise<BookMark> => {
    const response = await apiClient.put<BookMark>(
      API_ENDPOINTS.BOOKMARKS.UPDATE(id),
      data
    );
    return response.data;
  },

  /**
   * Delete a bookmark
   */
  deleteBookmark: async (id: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.BOOKMARKS.DELETE(id));
  },
};

export default listeningService;
