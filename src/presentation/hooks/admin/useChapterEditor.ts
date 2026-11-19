'use client';

import { useState } from 'react';
import type { Chapter } from '@/src/shared/types';
import { chapterService } from '@/src/infrastructure/api/services';
import { showAlert } from '@/src/presentation/components/common';
import { getApiErrorMessage } from '@/src/shared/utils';

interface Options {
  bookId: number;
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

/** Bản nháp tài liệu của chương đang mở. */
export const useChapterEditor = ({ bookId, activeChapter, setChapters }: Options) => {
  const [contentDraft, setContentDraft] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  // Tăng lên khi cần nạp lại bản nháp vào trình soạn thảo đang mở
  const [textVersion, setTextVersion] = useState(0);

  const savedContent = activeChapter?.content || '';

  // Đặt lại bản nháp mỗi khi chuyển sang chương khác
  const [draftChapterId, setDraftChapterId] = useState<number | undefined>(undefined);
  const [syncedContent, setSyncedContent] = useState('');
  if (activeChapter && activeChapter.id !== draftChapterId) {
    setDraftChapterId(activeChapter.id);
    setContentDraft(savedContent);
    setSyncedContent(savedContent);
  } else if (savedContent !== syncedContent) {
    // Nội dung đã lưu thay đổi (do chính mình lưu, hoặc tải lại có kết quả OCR mới). Cập nhật theo
    // thay đổi từ bên ngoài, trừ khi đang có chỉnh sửa cần giữ, để bản nháp cũ không ghi đè lên.
    setSyncedContent(savedContent);
    if (contentDraft === syncedContent) {
      setContentDraft(savedContent);
      setTextVersion((version) => version + 1);
    }
  }

  /** Bỏ chỉnh sửa chưa lưu, để nội dung mới từ backend (ví dụ sau khi gộp chương) được nạp vào trình soạn. */
  const discardDraft = () => {
    setContentDraft(syncedContent);
    setTextVersion((version) => version + 1);
  };

  const saveText = async () => {
    if (!activeChapter) return;
    setIsSavingText(true);
    try {
      await chapterService.updateChapter(bookId, activeChapter.id, { content: contentDraft });
      setChapters((prev) => prev.map((c) => (c.id === activeChapter.id ? { ...c, content: contentDraft } : c)));
    } catch (error) {
      console.error('Error saving chapter text:', error);
      showAlert(getApiErrorMessage(error, 'Không thể lưu nội dung chương. Vui lòng thử lại.'));
    } finally {
      setIsSavingText(false);
    }
  };

  const hasUnsavedChanges = contentDraft !== savedContent;

  return {
    contentDraft,
    savedContent,
    textVersion,
    updateDraft: setContentDraft,
    discardDraft,
    isSavingText,
    hasUnsavedChanges,
    saveText,
  };
};
