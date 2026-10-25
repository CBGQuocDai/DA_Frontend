'use client';

import { useState } from 'react';
import type { Chapter } from '@/src/shared/types';
import { chapterService } from '@/src/infrastructure/api/services';
import { useCopyToClipboard } from '../common';

export type FontSize = 'sm' | 'base' | 'lg';

interface Options {
  bookId: number;
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

/** Raw-text reading/editing state for the active chapter. */
export const useChapterEditor = ({ bookId, activeChapter, setChapters }: Options) => {
  const [isEditingText, setIsEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const { copiedKey, copy } = useCopyToClipboard();

  // Reset the draft whenever a different chapter becomes active
  const [draftChapterId, setDraftChapterId] = useState<number | undefined>(undefined);
  if (activeChapter && activeChapter.id !== draftChapterId) {
    setDraftChapterId(activeChapter.id);
    setTextDraft(activeChapter.rawText || '');
    setIsEditingText(false);
  }

  const saveText = async () => {
    if (!activeChapter) return;
    setIsSavingText(true);
    try {
      await chapterService.updateChapter(bookId, activeChapter.id, { rawText: textDraft });
      setChapters((prev) =>
        prev.map((c) => (c.id === activeChapter.id ? { ...c, rawText: textDraft } : c))
      );
      setIsEditingText(false);
    } catch (error) {
      console.error('Error saving chapter text:', error);
      alert('Không thể lưu nội dung chương. Vui lòng thử lại.');
    } finally {
      setIsSavingText(false);
    }
  };

  const copyText = () => {
    if (!activeChapter?.rawText) return;
    copy(activeChapter.rawText, 'chapter-text');
  };

  return {
    isEditingText,
    setIsEditingText,
    textDraft,
    setTextDraft,
    isSavingText,
    fontSize,
    setFontSize,
    copyFeedback: copiedKey === 'chapter-text',
    saveText,
    copyText,
  };
};
