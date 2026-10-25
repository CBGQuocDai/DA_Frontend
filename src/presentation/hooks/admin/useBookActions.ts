'use client';

import { useState } from 'react';
import {
  bookService,
  categoryService,
  authorService,
  voiceService,
} from '@/src/infrastructure/api/services';
import type { Book, Category, Author, Voice } from '@/src/shared/types';
import type { BookFormValues } from '@/src/presentation/components/admin/BookFormModal';

interface Options {
  book: Book | null;
  setBook: (book: Book) => void;
  reload: () => Promise<void>;
}

/** Publish / unpublish and the "edit book" modal flow. */
export const useBookActions = ({ book, setBook, reload }: Options) => {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);

  const runAction = async (key: string, task: () => Promise<unknown>, errorMessage: string) => {
    if (!book) return;
    setActionLoading(key);
    try {
      await task();
      await reload();
    } catch (error) {
      console.error(`Error (${key}) book:`, error);
      alert(errorMessage);
    } finally {
      setActionLoading(null);
    }
  };

  const publish = () =>
    runAction(
      'publish',
      () => bookService.publishBook(book!.id),
      'Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.'
    );

  const unpublish = () =>
    runAction('unpublish', () => bookService.unpublishBook(book!.id), 'Có lỗi xảy ra khi gỡ sách.');

  const openEdit = async () => {
    if (!book) return;
    try {
      const [cats, auths, voiceRes] = await Promise.all([
        categoryService.getCategories(),
        authorService.getAuthors(),
        voiceService.getVoices(),
      ]);
      setCategories(cats ?? []);
      setAuthors(auths ?? []);
      setVoices((voiceRes as any)?.content ?? (Array.isArray(voiceRes) ? voiceRes : []));
    } catch (err) {
      console.error('Error fetching options for book edit:', err);
    }
    setIsEditOpen(true);
  };

  // Errors propagate to BookFormModal, which shows them inline
  const saveEdit = async (data: BookFormValues) => {
    if (!book) return;

    const form = new FormData();
    const payload = {
      title: data.title,
      description: data.description,
      price: data.price,
      voice: { id: data.voiceId },
      categories: data.categoryIds.map((id) => ({ id })),
      authors: data.authorIds.map((id) => ({ id })),
    };
    form.append('book', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
    if (data.coverFile) form.append('bookCover', data.coverFile);

    const updated = await bookService.updateBook(book.id, form);
    if (updated) setBook(updated);
    setIsEditOpen(false);
    await reload();
  };

  return {
    actionLoading,
    publish,
    unpublish,
    edit: {
      isOpen: isEditOpen,
      categories,
      authors,
      voices,
      open: openEdit,
      close: () => setIsEditOpen(false),
      save: saveEdit,
    },
  };
};
