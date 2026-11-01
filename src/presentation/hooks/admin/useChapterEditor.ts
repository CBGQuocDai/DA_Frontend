'use client';

import { useMemo, useState } from 'react';
import type { Chapter } from '@/src/shared/types';
import { chapterService } from '@/src/infrastructure/api/services';
import { getValidContent } from '@/src/presentation/components/admin/bookDetail/chapterEditor/plainText';
import { showAlert } from '@/src/presentation/components/common';

interface Options {
  bookId: number;
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
}

/** Text and formatting drafts for the active chapter. */
export const useChapterEditor = ({ bookId, activeChapter, setChapters }: Options) => {
  const [textDraft, setTextDraft] = useState('');
  const [contentDraft, setContentDraft] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  // Bumped when the draft must be reloaded into the already open editor
  const [textVersion, setTextVersion] = useState(0);

  const savedText = activeChapter?.rawText || '';
  const contentJson = activeChapter?.contentJson;
  const savedContent = useMemo(() => getValidContent(contentJson, savedText), [contentJson, savedText]);

  // Reset the draft whenever a different chapter becomes active
  const [draftChapterId, setDraftChapterId] = useState<number | undefined>(undefined);
  const [syncedText, setSyncedText] = useState('');
  const [syncedContent, setSyncedContent] = useState('');
  if (activeChapter && activeChapter.id !== draftChapterId) {
    setDraftChapterId(activeChapter.id);
    setTextDraft(savedText);
    setContentDraft(savedContent);
    setSyncedText(savedText);
    setSyncedContent(savedContent);
  } else if (savedText !== syncedText || savedContent !== syncedContent) {
    // The saved text changed (our own save, or a reload picking up OCR results). Follow a
    // change from elsewhere unless there are edits to keep, so a stale draft can't overwrite it.
    setSyncedText(savedText);
    setSyncedContent(savedContent);
    if (textDraft === syncedText && contentDraft === syncedContent) {
      setTextDraft(savedText);
      setContentDraft(savedContent);
      setTextVersion((version) => version + 1);
    }
  }

  const updateDraft = (text: string, content: string) => {
    setTextDraft(text);
    setContentDraft(content);
  };

  const saveText = async () => {
    if (!activeChapter) return;
    setIsSavingText(true);
    try {
      await chapterService.updateChapter(
        bookId,
        activeChapter.id,
        contentDraft ? { contentJson: contentDraft } : { rawText: textDraft }
      );
      setChapters((prev) =>
        prev.map((c) => (c.id === activeChapter.id ? { ...c, rawText: textDraft, contentJson: contentDraft } : c))
      );
    } catch (error) {
      console.error('Error saving chapter text:', error);
      showAlert('Không thể lưu nội dung chương. Vui lòng thử lại.');
    } finally {
      setIsSavingText(false);
    }
  };

  const hasUnsavedChanges = textDraft !== savedText || contentDraft !== savedContent;

  return {
    textDraft,
    contentDraft,
    savedContent,
    textVersion,
    updateDraft,
    isSavingText,
    hasUnsavedChanges,
    saveText,
  };
};
