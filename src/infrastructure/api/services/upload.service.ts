import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';

export type UploadType = 'PDF' | 'IMAGE' | 'AUDIO';

interface UploadUrlResponse {
  uploadUrl: string;
  filePath: string;
  /** Must be sent exactly as given, the signature covers them */
  headers: Record<string, string>;
}

export const uploadService = {
  /**
   * Uploads `file` straight to cloud storage through a URL signed by the backend
   * and returns its temporary path. Send that path in the book/voice request:
   * the backend checks the file then, and each path can only be used once.
   */
  uploadFile: async (file: File, type: UploadType): Promise<string> => {
    const { uploadUrl, filePath, headers } = unwrap<UploadUrlResponse>(
      await apiClient.post(API_ENDPOINTS.UPLOADS.SIGN_URL, {
        type,
        fileName: file.name,
        size: file.size,
      })
    );
    // Plain fetch: the signed URL is absolute and must not get the API auth header
    const response = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
    if (!response.ok) {
      throw new Error(`Upload of "${file.name}" failed with status ${response.status}`);
    }
    return filePath;
  },
};
