'use client';

import { useState } from 'react';
import { chapterService, uploadService } from '@/src/infrastructure/api/services';
import type { Chapter } from '@/src/shared/types';
import { getApiErrorMessage, getAudioDuration } from '@/src/shared/utils';
import { showAlert, toast } from '@/src/presentation/components/common';

const chapterLabel = (chapter: Chapter) => chapter.title || `Chương ${chapter.chapterOrder}`;

interface Options {
  bookId: number;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  setChapters: React.Dispatch<React.SetStateAction<Chapter[]>>;
  setSelectedChapterId: (id: number | null) => void;
  onChapterCreated?: () => void;
}

/** Thêm/sửa/xóa chương, tạo audio bằng AI, upload audio và trạng thái các modal liên quan. */
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

  // Backend có thể đánh lại thứ tự hoặc đổi trạng thái chương khác nên luôn đọc lại cả danh sách
  const reloadChapters = async () => {
    setChapters(await chapterService.getChapters(bookId));
  };

  const createChapter = async (title: string, chapterOrder: number) => {
    const created = await chapterService.createChapter(bookId, { title, chapterOrder });
    toast.success(`Đã thêm chương “${title}”`);
    await reloadChapters();
    setSelectedChapterId(created.id);
    onChapterCreated?.();
  };

  /** Gộp các chương rồi mở chương đã gộp; trả về false nếu backend từ chối. */
  const mergeChapters = async (chapterIds: number[]) => {
    try {
      const merged = await chapterService.mergeChapters(bookId, chapterIds);
      toast.success(`Đã gộp ${chapterIds.length} chương`);
      await reloadChapters();
      setSelectedChapterId(merged.id);
      return true;
    } catch (error) {
      console.error('Error merging chapters:', error);
      showAlert(getApiErrorMessage(error, 'Không thể gộp các chương này. Vui lòng thử lại.'));
      return false;
    }
  };

  const deleteActiveChapter = async () => {
    if (!activeChapter) return;
    setIsDeleting(true);
    try {
      await chapterService.deleteChapter(bookId, activeChapter.id);
      toast.success(`Đã xóa chương “${chapterLabel(activeChapter)}”`);
      const remaining = chapters.filter((c) => c.id !== activeChapter.id);
      setChapters(remaining);
      setSelectedChapterId(remaining.length > 0 ? remaining[0].id : null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      showAlert(getApiErrorMessage(error, 'Có lỗi xảy ra khi xóa chương này.'));
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const generateVoice = async (chapterId: number, speed: number) => {
    setGeneratingChapterId(chapterId);
    try {
      await chapterService.generateAudio(bookId, chapterId, speed);
      toast.info('Đã gửi yêu cầu tạo audio. Bạn sẽ nhận thông báo khi audio sẵn sàng.');
      // Backend xử lý nền; đánh dấu ngay, trạng thái cuối sẽ về qua SSE (useBookDetailData)
      setChapters((prev) =>
        prev.map((c) => (c.id === chapterId ? { ...c, status: 'PROCESSING_AUDIO', readingSpeed: speed } : c))
      );
    } catch (error) {
      console.error('Error generating voice audio:', error);
      showAlert(getApiErrorMessage(error, 'Không thể tạo audio tự động cho chương này. Vui lòng thử lại sau.'));
    } finally {
      setGeneratingChapterId(null);
    }
  };

  const uploadAudio = async (chapterId: number, file: File) => {
    setUploadingChapterId(chapterId);
    try {
      // Đọc thời lượng trước: file không phát được thì khỏi tốn công upload
      const duration = await getAudioDuration(file);
      const audioPath = await uploadService.uploadFile(file, 'AUDIO');
      await chapterService.uploadAudio(bookId, chapterId, {
        audioPath,
        duration: Math.max(1, Math.round(duration)),
      });
      toast.success('Đã tải audio lên cho chương');
      await reloadChapters();
    } catch (error) {
      console.error('Error uploading chapter audio:', error);
      showAlert(
        getApiErrorMessage(error, 'Không thể tải audio lên cho chương này. Hãy chọn file MP3 hoặc WAV tối đa 10MB rồi thử lại.')
      );
    } finally {
      setUploadingChapterId(null);
    }
  };

  /** Mở hộp thoại chọn file của trình duyệt rồi upload file được chọn cho chương. */
  const pickAudioFile = (chapterId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.mp3,.wav,audio/mpeg,audio/wav';
    input.onchange = () => {
      const file = input.files?.[0];
      if (file) uploadAudio(chapterId, file);
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
    deleteModal: {
      isOpen: showDeleteModal,
      isDeleting,
      open: () => activeChapter && setShowDeleteModal(true),
      close: () => setShowDeleteModal(false),
      confirm: deleteActiveChapter,
    },
    createChapter,
    mergeChapters,
    reloadChapters,
    generateVoice,
    pickAudioFile,
  };
};
