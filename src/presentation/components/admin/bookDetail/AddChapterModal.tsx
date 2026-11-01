import React, { useState } from 'react';
import { Modal, Button, Spinner, showAlert } from '@/src/presentation/components/common';

interface AddChapterModalProps {
  onClose: () => void;
  defaultChapterOrder: number;
  onSubmit: (title: string, chapterOrder: number) => Promise<void>;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  onClose,
  defaultChapterOrder,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: '',
    // Kept as text so clearing the field stays empty and `required` can catch it
    chapterOrder: String(defaultChapterOrder),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showAlert('Vui lòng nhập tiêu đề chương', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form.title.trim(), Number(form.chapterOrder));
      onClose();
    } catch (error) {
      console.error('Error creating chapter:', error);
      showAlert('Không thể tạo chương. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Thêm chương mới" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Tiêu đề chương <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ví dụ: Chương 1: Mở đầu"
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Thứ tự chương <span className="text-error">*</span>
          </label>
          <input
            type="number"
            value={form.chapterOrder}
            onChange={(e) => setForm({ ...form, chapterOrder: e.target.value })}
            min={0}
            required
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Spinner />
                <span>Đang tạo...</span>
              </>
            ) : (
              <span>Lưu chương</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
