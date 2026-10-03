import { apiClient } from '../config/apiClient';
import type { Voice } from '@/src/shared/types';

export const voiceService = {
  getVoices: async (): Promise<{ content: Voice[]; total: number }> => {
    const response = await apiClient.get<any>('/voice');
    const data = response.data?.data ?? response.data;
    return Array.isArray(data) ? { content: data, total: data.length } : data;
  },

  createVoice: async (data: FormData): Promise<Voice> => {
    const response = await apiClient.post<any>('/voice', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data ?? response.data;
  },

  updateVoice: async (
    voiceId: number,
    data: { name: string; description?: string }
  ): Promise<Voice> => {
    const response = await apiClient.put<any>(`/voice/${voiceId}`, data);
    return response.data?.data ?? response.data;
  },

  deleteVoice: async (voiceId: number): Promise<void> => {
    await apiClient.delete(`/voice/${voiceId}`);
  },
};

export default voiceService;
