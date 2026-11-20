export interface AvatarImage {
  name: string;
  size: number;
  type: string;
}

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export const validateAvatar = (image: AvatarImage): string | null => {
  if (!IMAGE_EXTENSIONS.test(image.name) || (image.type && !IMAGE_MIME_TYPES.has(image.type))) {
    return 'Vui lòng chọn ảnh JPG, PNG hoặc WebP.';
  }
  if (image.size <= 0) return 'Ảnh được chọn đang trống. Vui lòng chọn ảnh khác.';
  if (image.size > AVATAR_MAX_BYTES) return 'Ảnh đại diện không được vượt quá 5 MB.';
  return null;
};
