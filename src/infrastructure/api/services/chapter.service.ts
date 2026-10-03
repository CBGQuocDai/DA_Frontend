import { apiClient } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Chapter } from '@/src/shared/types';


export const chapterService = {
  getChapters: async (bookId: number): Promise<Chapter[]> => {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.CHAPTERS.LIST(bookId)
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return response.data?.data ?? [];
  },

  createChapter: async (bookId: number, data: { title: string; rawText?: string; chapterOrder?: number }): Promise<Chapter> => {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.CHAPTERS.CREATE(bookId),
      data
    );
    return response.data?.data ?? response.data;
  },

  deleteChapter: async (bookId: number, chapterId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CHAPTERS.DELETE(bookId, chapterId));
  },

  generateAudio: async (bookId: number, chapterId: number): Promise<Chapter> => {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.CHAPTERS.GENERATE_AUDIO(bookId, chapterId)
    );
    return response.data?.data ?? response.data;
  },
};

export default chapterService;
