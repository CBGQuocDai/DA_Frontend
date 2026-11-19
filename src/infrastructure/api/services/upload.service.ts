import { apiClient, unwrap } from '../config/apiClient';
import { API_ENDPOINTS } from '@/src/shared/constants';
import type { UploadType, UploadUrlResponse } from '@/src/shared/types';

export const uploadService = {
  /**
   * Upload `file` thẳng lên cloud storage qua URL do backend ký (POST /uploads/sign-url)
   * rồi trả về đường dẫn tạm. Gửi đường dẫn này trong request tạo/sửa sách, giọng đọc,
   * tác giả hoặc audio chương: lúc đó backend mới kiểm tra file, và mỗi đường dẫn chỉ dùng được một lần.
   */
  uploadFile: async (file: File, type: UploadType): Promise<string> => {
    const { uploadUrl, filePath, headers } = unwrap<UploadUrlResponse>(
      await apiClient.post(API_ENDPOINTS.UPLOADS.SIGN_URL, {
        type,
        fileName: file.name,
        size: file.size,
      })
    );
    // Dùng fetch thuần: URL đã ký là URL tuyệt đối và không được kèm header xác thực của API
    const response = await fetch(uploadUrl, { method: 'PUT', headers, body: file });
    if (!response.ok) {
      throw new Error(`Upload of "${file.name}" failed with status ${response.status}`);
    }
    return filePath;
  },
};
