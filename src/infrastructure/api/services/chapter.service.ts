import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Chapter, ChapterAudioPayload, ChapterCreatePayload, ChapterUpdatePayload } from '@/src/shared/types';

/** Các API của ChapterController: quản lý chương cho admin, và tệp đính kèm cho cả admin lẫn người nghe. */
export const chapterService = {
  getChapters: async (bookId: number): Promise<Chapter[]> =>
    unwrap<Chapter[]>(await apiClient.get(API_ENDPOINTS.CHAPTERS.ROOT(bookId))) ?? [],

  createChapter: async (bookId: number, payload: ChapterCreatePayload): Promise<Chapter> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CHAPTERS.ROOT(bookId), payload)),

  updateChapter: async (bookId: number, chapterId: number, payload: ChapterUpdatePayload): Promise<void> => {
    await apiClient.patch(API_ENDPOINTS.CHAPTERS.DETAIL(bookId, chapterId), payload);
  },

  deleteChapter: async (bookId: number, chapterId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.CHAPTERS.DETAIL(bookId, chapterId));
  },

  /**
   * Gộp các chương liền nhau vào chương có thứ tự nhỏ nhất và trả về chương đó. Nội dung các chương sau
   * được nối vào kèm tiêu đề; audio của chương gộp bị xóa và job tạo audio đang chạy bị hủy.
   */
  mergeChapters: async (bookId: number, chapterIds: number[]): Promise<Chapter> =>
    unwrap(await apiClient.post(API_ENDPOINTS.CHAPTERS.MERGE(bookId), { chapterIds })),

  /**
   * Yêu cầu tạo audio bằng AI. Backend chỉ nhận yêu cầu rồi xử lý nền (chương chuyển sang
   * PROCESSING_AUDIO), không trả về dữ liệu. `speed` là hệ số tốc độ đọc, 0.5–2.0 (1 = bình thường).
   */
  generateAudio: async (bookId: number, chapterId: number, speed = 1): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.CHAPTERS.AUDIO(bookId, chapterId), { bookId, chapterId, speed });
  },

  /** Gán file audio đã upload cho chương; backend từ chối khi chương đang được tạo audio. */
  uploadAudio: async (bookId: number, chapterId: number, payload: ChapterAudioPayload): Promise<void> => {
    await apiClient.put(API_ENDPOINTS.CHAPTERS.AUDIO(bookId, chapterId), payload);
  },

  /**
   * File PDF ảnh và bảng của chương, dựng từ nội dung đã lưu. Gửi kèm token để backend kiểm tra quyền:
   * admin xem mọi chương, người chưa mua chỉ xem chương miễn phí. Lỗi 404 khi chương không có tệp đính kèm.
   */
  getAttachmentsPdf: async (bookId: number, chapterId: number): Promise<Blob> =>
    (await apiClient.get<Blob>(API_ENDPOINTS.CHAPTERS.ATTACHMENTS(bookId, chapterId), { responseType: 'blob' })).data,
};
