import React, { useState } from 'react';
import { Modal, Button } from '@/src/presentation/components/common';
import type { Chapter } from '@/src/shared/types';
import { chapterService } from '@/src/infrastructure/api/services';

interface EditChapterModalProps {
  bookId: number;
  onClose: () => void;
  chapter: Chapter;
  onSuccess: (updated: Chapter) => void;
}

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  bookId,
  onClose,
  chapter,
  onSuccess,
}) => {
  // The modal is mounted per open, so the chapter only seeds the initial form
  const [infoForm, setInfoForm] = useState({
    title: chapter.title || '',
    chapterOrder: chapter.chapterOrder,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề chương');
      return;
    }
    const title = infoForm.title.trim();
    try {
      await chapterService.updateChapter(bookId, chapter.id, { title });
      onSuccess({
        ...chapter,
        title,
        chapterOrder: infoForm.chapterOrder,
      });
      onClose();
    } catch (error) {
      console.error('Error updating chapter:', error);
      alert('Không thể cập nhật thông tin chương. Vui lòng thử lại.');
    }
  };

  return (
    <Modal title="Chỉnh sửa thông tin chương" onClose={onClose} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Tiêu đề chương <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={infoForm.title}
            onChange={(e) => setInfoForm({ ...infoForm, title: e.target.value })}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Thứ tự chương
          </label>
          <input
            type="number"
            value={infoForm.chapterOrder}
            onChange={(e) => setInfoForm({ ...infoForm, chapterOrder: Number(e.target.value) })}
            min={1}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
          <p className="text-xs text-text-muted mt-1">
            Hệ thống sẽ tự động sắp xếp lại vị trí các chương khác nếu cần.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary">
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
