import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Chapter } from '@/src/shared/types';

/** Partial update: only the provided fields are changed. */
export interface ChapterUpdatePayload {
  title?: string;
  rawText?: string;
}

export const chapterService = {
  getChapters: async (bookId: number): Promise<Chapter[]> =>
    unwrap<Chapter[]>(await apiClient.get(API_ENDPOINTS.CHAPTERS.LIST(bookId))) ?? [],

  createChapter: async (
    bookId: number,
    data: { title: string; rawText?: string; chapterOrder?: number }
  ): Promise<Chapter> => unwrap(await apiClient.post(API_ENDPOINTS.CHAPTERS.CREATE(bookId), data)),

  updateChapter: async (bookId: number, chapterId: number, data: ChapterUpdatePayload): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.CHAPTERS.UPDATE(bookId, chapterId), data);
  },

  deleteChapter: async (bookId: number, chapterId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CHAPTERS.DELETE(bookId, chapterId));
  },

  generateAudio: async (bookId: number, chapterId: number): Promise<Chapter> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CHAPTERS.GENERATE_AUDIO(bookId, chapterId))),
};
