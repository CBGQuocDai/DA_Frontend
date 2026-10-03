import React, { useState } from 'react';
import { Modal, Button } from '@/src/presentation/components/ui';
import { Loader2 } from 'lucide-react';

interface AddChapterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultChapterOrder: number;
  onSubmit: (title: string, chapterOrder: number, rawText: string) => Promise<void>;
}

export const AddChapterModal: React.FC<AddChapterModalProps> = ({
  isOpen,
  onClose,
  defaultChapterOrder,
  onSubmit,
}) => {
  const [form, setForm] = useState({
    title: '',
    chapterOrder: 1,
    rawText: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề chương');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form.title.trim(), form.chapterOrder, form.rawText);
      setForm({ title: '', chapterOrder: defaultChapterOrder + 1, rawText: '' });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setForm({ title: '', chapterOrder: defaultChapterOrder + 1, rawText: '' });
      onClose();
    }
  };

  return (
    <Modal title="Thêm chương mới" onClose={() => handleOpenChange(false)} size="lg">
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
            Thứ tự chương
          </label>
          <input
            type="number"
            value={form.chapterOrder}
            onChange={(e) => setForm({ ...form, chapterOrder: Number(e.target.value) })}
            min={1}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1.5">
            Nội dung văn bản (Text / OCR)
          </label>
          <textarea
            value={form.rawText}
            onChange={(e) => setForm({ ...form, rawText: e.target.value })}
            placeholder="Dán hoặc nhập toàn bộ nội dung chữ của chương tại đây..."
            rows={8}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent leading-relaxed resize-y font-sans"
          />
          <p className="text-xs text-text-muted mt-1">
            Nội dung chữ này sẽ được dùng khi bạn bấm nút "gen audio" để tạo audio AI.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={() => handleOpenChange(false)}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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

export default AddChapterModal;
