'use client';

import { useState } from 'react';
import { chapterService } from '@/src/infrastructure/api/services';
import type { Chapter, ChapterStatus } from '@/src/shared/types';
import { showAlert } from '@/src/presentation/components/common';

interface Options {
  bookId: number;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setSelectedChapterId: (id: number | null) => void;
  onChapterCreated?: () => void;
}

/** Chapter CRUD, AI audio generation, audio upload, and the add/edit chapter modals. */
export const useChapterActions = ({
  bookId,
  chapters,
  activeChapter,
  setChapters,
  setSelectedChapterId,
  onChapterCreated,
}: Options) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingChapterId, setGeneratingChapterId] = useState<number | null>(null);
  const [uploadingChapterId, setUploadingChapterId] = useState<number | null>(null);
  const [audioSpeed, setAudioSpeed] = useState(1);

  // The backend may renumber other chapters, so both flows re-read the list
  const reloadChapters = async () => {
    setChapters(await chapterService.getChapters(bookId));
  };

  const createChapter = async (title: string, chapterOrder: number) => {
    const created = await chapterService.createChapter(bookId, { title, chapterOrder });
    await reloadChapters();
    setSelectedChapterId(created.id);
    onChapterCreated?.();
  };

  const deleteActiveChapter = async () => {
    if (!activeChapter) return;
    setIsDeleting(true);
    try {
      await chapterService.deleteChapter(bookId, activeChapter.id);
      const remaining = chapters.filter((c) => c.id !== activeChapter.id);
      setChapters(remaining);
      setSelectedChapterId(remaining.length > 0 ? remaining[0].id : null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      showAlert('Có lỗi xảy ra khi xóa chương này.');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const generateVoice = async (chapterId: number, speed: number) => {
    setGeneratingChapterId(chapterId);
    try {
      await chapterService.generateAudio(bookId, chapterId, speed);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, status: 'PROCESSING_AUDIO' as ChapterStatus } : c
        )
      );
    } catch (error) {
      console.error('Error generating voice audio:', error);
      showAlert('Không thể tạo audio tự động cho chương này. Vui lòng thử lại sau.');
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
    audioSpeed,
    setAudioSpeed,
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
    deleteModal: {
      isOpen: showDeleteModal,
      isDeleting,
      open: () => activeChapter && setShowDeleteModal(true),
      close: () => setShowDeleteModal(false),
      confirm: deleteActiveChapter,
    },
    createChapter,
    reloadChapters,
    generateVoice,
    triggerUpload,
  };
};
