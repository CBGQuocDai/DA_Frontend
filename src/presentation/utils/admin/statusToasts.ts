import type { BookStatus, ChapterStatus } from '@/src/shared/types';
import { toast } from '@/src/presentation/components/common';

/** Toast khi SSE báo OCR của sách kết thúc. Bỏ qua các trạng thái không phải kết quả xử lý. */
export const notifyBookStatus = (status: BookStatus, title: string | undefined, bookId: number) => {
  const name = title ? `“${title}”` : `#${bookId}`;
  if (status === 'UNPUBLISHED') {
    toast.success(`Sách ${name} đã xử lý xong và sẵn sàng để xuất bản`, { title: 'Xử lý sách hoàn tất' });
  } else if (status === 'FAILED') {
    toast.error(`Không xử lý được nội dung sách ${name}`, { title: 'Xử lý sách thất bại' });
  }
};

/** Toast khi SSE báo việc tạo audio của một chương kết thúc. */
export const notifyChapterStatus = (status: ChapterStatus, chapterName: string) => {
  if (status === 'AUDIO_READY') {
    toast.success(`Audio của ${chapterName} đã sẵn sàng`, { title: 'Tạo audio hoàn tất' });
  } else if (status === 'FAILED') {
    toast.error(`Không tạo được audio cho ${chapterName}`, { title: 'Tạo audio thất bại' });
  }
};
