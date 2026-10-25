'use client';

import { useState } from 'react';
import { chapterService } from '@/src/infrastructure/api/services';
import type { Chapter, ChapterStatus } from '@/src/shared/types';

interface Options {
  bookId: number;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setSelectedChapterId: (id: number | null) => void;
  reload: () => Promise<void>;
  onChapterCreated?: () => void;
}

/** Chapter CRUD, AI audio generation, audio upload, and the add/edit chapter modals. */
export const useChapterActions = ({
  bookId,
  chapters,
  activeChapter,
  setChapters,
  setSelectedChapterId,
  reload,
  onChapterCreated,
}: Options) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [generatingChapterId, setGeneratingChapterId] = useState<number | null>(null);
  const [uploadingChapterId, setUploadingChapterId] = useState<number | null>(null);

  const refreshChapters = async () => {
    const refreshed = await chapterService.getChapters(bookId);
    setChapters(refreshed ?? []);
    return refreshed;
  };

  const createChapter = async (title: string, chapterOrder: number, rawText: string) => {
    const created = await chapterService.createChapter(bookId, { title, chapterOrder, rawText });

    if (created && created.id) {
      await refreshChapters();
      setSelectedChapterId(created.id);
      onChapterCreated?.();
    } else {
      await reload();
    }
  };

  const handleEditSuccess = (updated: Chapter) => {
    setChapters((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    chapterService.getChapters(bookId).then((refreshed) => {
      if (refreshed) setChapters(refreshed);
    });
  };

  const deleteActiveChapter = async () => {
    if (!activeChapter) return;
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa "${activeChapter.title || `Chương ${activeChapter.chapterOrder}`}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmed) return;

    try {
      await chapterService.deleteChapter(bookId, activeChapter.id);
      const remaining = chapters.filter((c) => c.id !== activeChapter.id);
      setChapters(remaining);
      setSelectedChapterId(remaining.length > 0 ? remaining[0].id : null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Có lỗi xảy ra khi xóa chương này.');
    }
  };

  const generateVoice = async (chapterId: number) => {
    setGeneratingChapterId(chapterId);
    try {
      await chapterService.generateAudio(bookId, chapterId);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, status: 'PROCESSING_AUDIO' as ChapterStatus } : c
        )
      );
    } catch (error) {
      console.error('Error generating voice audio:', error);
      alert('Không thể tạo audio tự động cho chương này. Vui lòng thử lại sau.');
    } finally {
      setGeneratingChapterId(null);
    }
  };

  const uploadAudio = async () => {
    try {
      const updated = await chapterService.getChapters(bookId);
      if (updated && updated.length > 0) setChapters(updated);
    } catch (error) {
      console.error('Error reloading chapters:', error);
    } finally {
      setUploadingChapterId(null);
    }
  };

  const triggerUpload = (chapterId: number) => {
    setUploadingChapterId(chapterId);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadAudio();
      else setUploadingChapterId(null);
    };
    input.click();
  };

  return {
    generatingChapterId,
    uploadingChapterId,
    addModal: {
      isOpen: showAddModal,
      open: () => setShowAddModal(true),
      close: () => setShowAddModal(false),
    },
    editModal: {
      isOpen: showEditModal,
      open: () => activeChapter && setShowEditModal(true),
      close: () => setShowEditModal(false),
    },
    createChapter,
    handleEditSuccess,
    deleteActiveChapter,
    generateVoice,
    triggerUpload,
  };
};
