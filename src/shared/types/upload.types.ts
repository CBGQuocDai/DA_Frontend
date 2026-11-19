// Kiểu dữ liệu upload file (UploadController)

/** Loại file backend chấp nhận: PDF ≤ 100MB, IMAGE (jpg/png/webp) ≤ 5MB, AUDIO (mp3/wav) ≤ 10MB. */
export type UploadType = 'PDF' | 'IMAGE' | 'AUDIO';

export interface UploadUrlResponse {
  uploadUrl: string;
  filePath: string;
  /** Phải gửi đúng nguyên văn vì chữ ký của URL bao gồm cả các header này */
  headers: Record<string, string>;
}
