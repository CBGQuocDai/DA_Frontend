import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { Voice } from '@/src/shared/types';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

export const voiceService = {
  getVoices: async (): Promise<{ content: Voice[]; total: number }> => {
    const data = unwrap<Voice[] | { content: Voice[]; total: number }>(
      await apiClient.get(API_ENDPOINTS.VOICES.LIST)
    );
    return Array.isArray(data) ? { content: data, total: data.length } : data;
  },

  createVoice: async (data: FormData): Promise<Voice> =>
    unwrap(await apiClient.post(API_ENDPOINTS.VOICES.LIST, data, multipart)),

  updateVoice: async (voiceId: number, data: FormData): Promise<Voice> =>
    unwrap(await apiClient.put(API_ENDPOINTS.VOICES.DETAIL(voiceId), data, multipart)),

  deleteVoice: async (voiceId: number): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.VOICES.DETAIL(voiceId));
  },
};
