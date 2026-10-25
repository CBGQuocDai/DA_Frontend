'use client';

import { useState, useEffect } from 'react';
import type { Chapter } from '@/src/shared/types';
import { chapterService } from '@/src/infrastructure/api/services';

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
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Reset the draft whenever a different chapter becomes active
  useEffect(() => {
    if (activeChapter) {
      setTextDraft(activeChapter.rawText || '');
      setIsEditingText(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChapter?.id]);

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
    navigator.clipboard.writeText(activeChapter.rawText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  return {
    isEditingText,
    setIsEditingText,
    textDraft,
    setTextDraft,
    isSavingText,
    fontSize,
    setFontSize,
    copyFeedback,
    saveText,
    copyText,
  };
};
