import type { Book, BookStatus } from '@/src/shared/types';
import { getBookStatus } from '@/src/shared/utils';
import { Badge, type BadgeVariant } from '@/src/presentation/components/common';

export const bookStatusConfig: Record<BookStatus, { label: string; variant: BadgeVariant }> = {
  PROCESSING: { label: 'Đang xử lý', variant: 'warning' },
  UNPUBLISHED: { label: 'Chưa xuất bản', variant: 'default' },
  PUBLISHED: { label: 'Đã xuất bản', variant: 'success' },
  FAILED: { label: 'Xử lý lỗi', variant: 'error' },
};

export function getBookStatusBadge(book: Book) {
  const status = getBookStatus(book);
  const config = bookStatusConfig[status] ?? { label: status, variant: 'default' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
