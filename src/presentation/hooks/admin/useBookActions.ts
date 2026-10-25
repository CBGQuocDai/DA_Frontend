'use client';

import { useState } from 'react';
import { bookService } from '@/src/infrastructure/api/services';
import type { Book, BookStatus } from '@/src/shared/types';
import { toBookFormData, type BookFormValues } from '@/src/presentation/components/admin/book';
import { useBookFormOptions } from './useBookFormOptions';

interface Options {
  book: Book | null;
  setBook: (book: Book) => void;
  reload: () => Promise<void>;
}

/** Publish / unpublish and the "edit book" modal flow. */
export const useBookActions = ({ book, setBook, reload }: Options) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const options = useBookFormOptions();

  const changeStatus = async (
    key: 'publish' | 'unpublish',
    task: (bookId: number) => Promise<void>,
    status: BookStatus,
    errorMessage: string
  ) => {
    if (!book) return;
    setActionLoading(key);
    try {
      await task(book.id);
      setBook({ ...book, status, isPublish: status === 'PUBLISHED' });
    } catch (error) {
      console.error(`Error (${key}) book:`, error);
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const publish = () =>
    changeStatus(
      'publish',
      bookService.publishBook,
      'PUBLISHED',
      'Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.'
    );

  const unpublish = () =>
    changeStatus('unpublish', bookService.unpublishBook, 'UNPUBLISHED', 'Có lỗi xảy ra khi gỡ sách.');

  // Errors propagate to BookFormModal, which shows them inline
  const saveEdit = async (data: BookFormValues) => {
    if (!book) return;
    await bookService.updateBook(book.id, toBookFormData(data));
    setIsEditOpen(false);
    // Reload instead of using the response so the cover goes through the same lookup as loadData
    await reload();
  };

  return {
    actionLoading,
    publish,
    unpublish,
    edit: {
      isOpen: isEditOpen,
      ...options,
      open: () => setIsEditOpen(true),
      close: () => setIsEditOpen(false),
      save: saveEdit,
    },
  };
};
