import type { Book, BookStatus } from '@/src/shared/types';
import { Badge, type BadgeVariant } from '@/src/presentation/components/common';

export const bookStatusConfig: Record<BookStatus, { label: string; variant: BadgeVariant }> = {
  PROCESSING: { label: 'Đang xử lý', variant: 'warning' },
  UNPUBLISHED: { label: 'Chưa xuất bản', variant: 'default' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  FAILED: { label: 'Xử lý lỗi', variant: 'error' },
};

// Thông báo dự phòng khi backend không trả về lý do cụ thể
export const BOOK_PUBLISH_ERROR =
  'Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.';
export const BOOK_UNPUBLISH_ERROR = 'Có lỗi xảy ra khi gỡ sách.';

export function getBookStatusBadge(book: Book) {
  const config = bookStatusConfig[book.status] ?? { label: book.status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
