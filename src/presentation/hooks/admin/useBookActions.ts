'use client';

import { useState } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';
import { toBookPayload, type BookFormValues } from '@/src/presentation/components/admin/book';
import { showAlert } from '@/src/presentation/components/common';
import { BOOK_PUBLISH_ERROR, BOOK_UNPUBLISH_ERROR } from '@/src/presentation/utils/admin';
import { useBookFormOptions } from './useBookFormOptions';

interface Options {
  book: Book | null;
  setBook: (book: Book) => void;
  reload: () => Promise<void>;
}

/** Xuất bản / gỡ xuất bản và luồng modal "sửa sách" ở trang chi tiết sách. */
export const useBookActions = ({ book, setBook, reload }: Options) => {
  const [actionLoading, setActionLoading] = useState<'publish' | 'unpublish' | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  // Chỉ modal sửa mới cần các danh sách này nên chưa tải khi modal chưa mở
  const options = useBookFormOptions(isEditOpen);

  const setPublished = async (published: boolean) => {
    if (!book) return;
    setActionLoading(published ? 'publish' : 'unpublish');
    try {
      await (published ? bookService.publishBook(book.id) : bookService.unpublishBook(book.id));
      setBook({ ...book, status: published ? 'PUBLISHED' : 'UNPUBLISHED' });
    } catch (error) {
      console.error('Error changing book status:', error);
      showAlert(getApiErrorMessage(error, published ? BOOK_PUBLISH_ERROR : BOOK_UNPUBLISH_ERROR));
    } finally {
      setActionLoading(null);
    }
  };

  // Lỗi được ném tiếp cho BookFormModal để hiển thị ngay trong modal
  const saveEdit = async (data: BookFormValues) => {
    if (!book) return;
    await bookService.updateBook(book.id, await toBookPayload(data, book));
    setIsEditOpen(false);
    // Tải lại để ảnh bìa/PDF nhận URL mới được ký từ endpoint chi tiết
    await reload();
  };

  return {
    actionLoading,
    publish: () => setPublished(true),
    unpublish: () => setPublished(false),
    edit: {
      isOpen: isEditOpen,
      ...options,
      open: () => setIsEditOpen(true),
      close: () => setIsEditOpen(false),
      save: saveEdit,
    },
  };
};
