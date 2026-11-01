import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Voice } from '@/src/shared/types';

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
  getVoices: async (): Promise<{ content: Voice[]; total: number }> => {
    const data = unwrap<Voice[] | { content: Voice[]; total: number }>(
      await apiClient.get(API_ENDPOINTS.VOICES.LIST)
    );
    return Array.isArray(data) ? { content: data, total: data.length } : data;
  },

  createVoice: async (payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.post(API_ENDPOINTS.VOICES.LIST, payload)),

  updateVoice: async (voiceId: number, payload: VoicePayload): Promise<Voice> =>
    unwrap(await apiClient.put(API_ENDPOINTS.VOICES.DETAIL(voiceId), payload)),

  deleteVoice: async (voiceId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.VOICES.DETAIL(voiceId));
  },
};
