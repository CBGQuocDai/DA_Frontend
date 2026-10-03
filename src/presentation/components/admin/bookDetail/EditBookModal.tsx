import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/src/presentation/components/ui';
import { MultiSelectCombobox } from '@/src/presentation/components/common/MultiSelectCombobox';
import type { Book, Category, Author, Voice } from '@/src/shared/types';
import { Loader2 } from 'lucide-react';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book;
  categories: Category[];
  authors: Author[];
  voices: Voice[];
  isSubmitting: boolean;
  onSave: (data: {
    title: string;
    description: string;
    price: number;
    voiceId: number;
    categoryIds: number[];
    authorIds: number[];
    coverFile?: File | null;
  }) => Promise<void>;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  onClose,
  book,
  categories,
  authors,
  voices,
  isSubmitting,
  onSave,
}) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    voiceId: 0,
    categoryIds: [] as number[],
    authorIds: [] as number[],
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const coverInputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && book) {
      setForm({
        title: book.title || '',
        description: book.description || '',
        price: book.price ? Number(book.price) : 0,
        voiceId: book.voice?.id || 0,
        categoryIds: book.bookCategories?.map((bc) => bc.category.id) || [],
        authorIds: book.bookAuthors?.map((ba) => ba.author.id) || [],
      });
      setCoverFile(null);
      setCoverPreview(book.coverImage || null);
    }
  }, [isOpen, book]);

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setCoverPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề sách');
      return;
    }
    await onSave({ ...form, coverFile });
  };

  return (
    <Modal title="Chỉnh sửa thông tin sách" onClose={onClose} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">
            Tiêu đề sách <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Giá bán (VNĐ)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              min={0}
              step={1000}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1">Giọng đọc mặc định</label>
            <select
              value={form.voiceId}
              onChange={(e) => setForm({ ...form, voiceId: Number(e.target.value) })}
              className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent"
            >
              <option value={0}>-- Chọn giọng đọc --</option>
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} {v.description ? `(${v.description})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Thể loại (Danh mục)</label>
          <MultiSelectCombobox
            options={categories.map((c) => ({ id: c.id, name: c.name }))}
            selectedIds={form.categoryIds}
            onChange={(ids) => setForm({ ...form, categoryIds: ids })}
            placeholder="Chọn một hoặc nhiều danh mục..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Tác giả</label>
          <MultiSelectCombobox
            options={authors.map((a) => ({ id: a.id, name: a.fullName || `Tác giả #${a.id}` }))}
            selectedIds={form.authorIds}
            onChange={(ids) => setForm({ ...form, authorIds: ids })}
            placeholder="Chọn tác giả..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Mô tả sách</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent resize-y"
            placeholder="Nhập mô tả tóm tắt nội dung sách..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-1">Ảnh bìa sách mới (Tùy chọn)</label>
          <div className="flex items-center gap-4">
            {coverPreview && (
              <div className="w-14 h-20 bg-bg border border-border rounded-lg overflow-hidden flex-shrink-0">
                <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1">
              <input
                type="file"
                ref={coverInputRef}
                onChange={handleCoverSelect}
                accept="image/*"
                className="text-xs text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-surface file:border file:border-border file:cursor-pointer hover:file:bg-bg"
              />
              <p className="text-[11px] text-text-muted mt-1">Định dạng JPG, PNG, WebP (Tối đa 5MB)</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-border">
          <Button type="button" variant="secondary" onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EditBookModal;
