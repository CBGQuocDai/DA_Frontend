import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { PaginatedResponse, SearchParams, Voice, VoicePayload } from '@/src/shared/types';

/** Kích thước trang lớn nhất mà ô chọn giọng yêu cầu; hệ thống chỉ có vài giọng đọc. */
const ALL_VOICES_SIZE = 100;

/** Các API giọng đọc của admin (VoiceController). */
export const voiceService = {
  /** Toàn bộ giọng đọc (tối đa {@link ALL_VOICES_SIZE}), dùng cho các ô chọn. */
  getVoices: async (): Promise<Voice[]> =>
    (await voiceService.searchVoices({ page: 0, size: ALL_VOICES_SIZE })).content ?? [],

  /** Danh sách cho trang quản lý: lọc theo tên (GET /voice?voiceName=), mới nhất trước. */
  searchVoices: async ({ keyword, page = 0, size = 10 }: SearchParams): Promise<PaginatedResponse<Voice>> =>
    unwrap(
      await apiClient.get(API_ENDPOINTS.VOICES.ROOT, {
        params: { ...(keyword?.trim() ? { voiceName: keyword.trim() } : {}), page, size },
      }),
    ),

  createVoice: async (payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.post(API_ENDPOINTS.VOICES.ROOT, payload)),

  updateVoice: async (voiceId: number, payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.put(API_ENDPOINTS.VOICES.DETAIL(voiceId), payload)),

  deleteVoice: async (voiceId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.VOICES.DETAIL(voiceId));
  },
};
