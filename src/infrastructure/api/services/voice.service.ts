import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { PaginatedResponse, Voice } from '@/src/shared/types';
import type { SearchParams } from './search.params';

/** Largest page the pickers ask for; there are only a handful of voices. */
const ALL_VOICES_SIZE = 100;

/**
 * Body of both create (POST) and update (PUT, full replacement). `exampleAudio`
 * is always required: the storage path returned by uploadService, or on update
 * the current path to keep the sample.
 */
export interface VoicePayload {
  name: string;
  description: string;
  exampleAudio?: string;
}

export const voiceService = {
  /** Every voice (up to {@link ALL_VOICES_SIZE}), for pickers and counts. */
  getVoices: async (): Promise<PaginatedResponse<Voice>> =>
    voiceService.searchVoices({ page: 0, size: ALL_VOICES_SIZE }),

  /** Admin list, filtered by name (GET /voice?voiceName=), newest first. */
  searchVoices: async ({ keyword, page = 0, size = 10 }: SearchParams): Promise<PaginatedResponse<Voice>> =>
    unwrap(
      await apiClient.get(API_ENDPOINTS.VOICES.LIST, {
        params: { ...(keyword?.trim() ? { voiceName: keyword.trim() } : {}), page, size },
      }),
    ),

  createVoice: async (payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.post(API_ENDPOINTS.VOICES.LIST, payload)),

  updateVoice: async (voiceId: number, payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.put(API_ENDPOINTS.VOICES.DETAIL(voiceId), payload)),

  deleteVoice: async (voiceId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.VOICES.DETAIL(voiceId));
  },
};
