import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/src/presentation/components/ui';
import type { Chapter } from '@/src/shared/types';

interface EditChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: Chapter;
  bookId: number;
  onSuccess: (updated: Chapter) => void;
}

export const EditChapterModal: React.FC<EditChapterModalProps> = ({
  isOpen,
  onClose,
  chapter,
  bookId,
  onSuccess,
}) => {
  const [infoForm, setInfoForm] = useState({
    title: '',
    chapterOrder: 1,
  });
  const [isSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && chapter) {
      setInfoForm({
        title: chapter.title || '',
        chapterOrder: chapter.chapterOrder,
      });
    }
  }, [isOpen, chapter?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoForm.title.trim()) {
      alert('Vui lòng nhập tiêu đề chương');
      return;
    }

    onSuccess({
      ...chapter,
      title: infoForm.title.trim(),
      chapterOrder: infoForm.chapterOrder,
    });
    onClose();
  };

  return (
    <Modal
      title="Chỉnh sửa thông tin chương"
      onClose={onClose}
      size="md"
    >
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
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
          >
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditChapterModal;
