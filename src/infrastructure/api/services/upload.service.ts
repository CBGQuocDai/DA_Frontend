import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { UploadType, UploadUrlResponse } from '@/src/shared/types';

interface UploadOptions {
  accessToken?: string;
  signal?: AbortSignal;
}

const upload = async (file: File, type: UploadType, endpoint: string, options?: UploadOptions) => {
  const { uploadUrl, filePath, headers } = unwrap<UploadUrlResponse>(
    await apiClient.post(endpoint, { type, fileName: file.name, size: file.size }, {
      signal: options?.signal,
      headers: options?.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : undefined,
    })
  );
  // Chỉ gửi đúng header đã ký; không chuyển Bearer token hoặc cookie sang storage.
  const response = await fetch(uploadUrl, {
    method: 'PUT', headers, body: file, signal: options?.signal, credentials: 'omit',
  });
  if (!response.ok) {
    throw new Error(`Upload of "${file.name}" failed with status ${response.status}`);
  }
  return filePath;
};

export const uploadService = {
  /**
   * Upload `file` thẳng lên cloud storage qua URL do backend ký (POST /uploads/sign-url)
   * rồi trả về đường dẫn tạm. Gửi đường dẫn này trong request tạo/sửa sách, giọng đọc,
   * tác giả hoặc audio chương: lúc đó backend mới kiểm tra file, và mỗi đường dẫn chỉ dùng được một lần.
   */
  uploadFile: (file: File, type: UploadType): Promise<string> =>
    upload(file, type, API_ENDPOINTS.UPLOADS.SIGN_URL),

  uploadCustomerImage: (file: File, options: UploadOptions): Promise<string> =>
    upload(file, 'IMAGE', API_ENDPOINTS.UPLOADS.CUSTOMER_SIGN_URL, options),
};
