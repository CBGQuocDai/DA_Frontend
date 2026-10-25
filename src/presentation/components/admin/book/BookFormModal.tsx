'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import {
  Button,
  FileDropzone,
  Modal,
  MultiSelectCombobox,
  Spinner,
} from '@/src/presentation/components/common';
import type { Book, Category, Author, Voice } from '@/src/shared/types';
import { formatVnd } from '@/src/shared/utils';
import {
  COVER_ACCEPT,
  FIELD_ORDER,
  LIMITS,
  getServerMessage,
  validateBookForm,
  type FieldName,
  type FormState,
} from './bookFormValidation';
import {
  getBookAuthorIds,
  getBookCategoryIds,
  getBookPriceInput,
} from './bookFormValues';

export interface BookFormValues {
  title: string;
  description: string;
  price: number;
  voiceId: number;
  categoryIds: number[];
  authorIds: number[];
  /** Always set in create mode; only set in edit mode when the cover is replaced */
  coverFile: File | null;
  /** Always set in create mode; only set in edit mode when the PDF is replaced */
  pdfFile: File | null;
}

interface BookFormModalProps {
  mode: 'create' | 'edit';
  /** Required when mode is "edit" */
  book?: Book;
  categories: Category[];
  authors: Author[];
  voices: Voice[];
  onClose: () => void;
  /** Reject to keep the modal open and show the error inside it */
  onSubmit: (values: BookFormValues) => Promise<void>;
}

const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 bg-bg border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${hasError
    ? 'border-error focus:border-error focus:ring-error'
    : 'border-border focus:border-accent focus:ring-accent'
  }`;

interface FieldProps {
  name: FieldName;
  label: string;
  htmlFor?: string;
  optional?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

const Field = ({ name, label, htmlFor, optional, error, hint, children }: FieldProps) => (
  <div data-field={name}>
    <label
      htmlFor={htmlFor}
      className="mb-1.5 block text-sm font-medium text-text-primary"
    >
      {label}
      {!optional && <span className="text-error">*</span>}
    </label>
    {children}
    {error ? (
      <p
        id={`${name}-error`}
        role="alert"
        className="mt-1.5 text-xs text-error"
      >
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
    )}
  </div>
);

export const BookFormModal: React.FC<BookFormModalProps> = ({
  mode,
  book,
  categories,
  authors,
  voices,
  onClose,
  onSubmit,
}) => {
  const isEdit = mode === 'edit';

  const [form, setForm] = useState<FormState>(() => ({
    title: book?.title ?? '',
    description: book?.description ?? '',
    price: getBookPriceInput(book),
    voiceId: book?.voice?.id ?? 0,
    categoryIds: getBookCategoryIds(book),
    authorIds: getBookAuthorIds(book),
  }));
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>(
    {},
  );
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Object URL for the chosen cover; revoked when replaced or on unmount
  const coverUrl = useMemo(
    () => (coverFile ? URL.createObjectURL(coverFile) : null),
    [coverFile],
  );
  useEffect(() => {
    return () => {
      if (coverUrl) URL.revokeObjectURL(coverUrl);
    };
  }, [coverUrl]);

  const hasExistingCover = isEdit && !!book?.coverImage;
  const currentPdf = useMemo(() => {
    if (!isEdit || !book?.contentFile) return null;
    let name = 'original.pdf';
    try {
      name = new URL(book.contentFile).pathname.split('/').pop() || name;
    } catch {
      name = book.contentFile.split('?')[0].split('/').pop() || name;
    }
    return { name, url: book.contentFile };
  }, [isEdit, book?.contentFile]);
  const errors = useMemo(
    () =>
      validateBookForm({
        form,
        coverFile,
        pdfFile,
        hasExistingCover,
        requirePdf: !isEdit,
      }),
    [form, coverFile, pdfFile, hasExistingCover, isEdit],
  );
  const shown = (name: FieldName) =>
    submitAttempted || touched[name] ? errors[name] : undefined;
  const touch = (name: FieldName) =>
    setTouched((t) => ({ ...t, [name]: true }));
  const update = (patch: Partial<FormState>) => {
    setServerError(null);
    setForm((f) => ({ ...f, ...patch }));
  };

  const previewUrl =
    coverUrl ?? (hasExistingCover ? (book?.coverImage ?? null) : null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitAttempted(true);
    setServerError(null);

    const firstInvalid = FIELD_ORDER.find((name) => errors[name]);
    if (firstInvalid) {
      const el = document.querySelector<HTMLElement>(
        `[data-field="${firstInvalid}"]`,
      );
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.querySelector<HTMLElement>('input, textarea, select, button')?.focus({
        preventScroll: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        voiceId: form.voiceId,
        categoryIds: form.categoryIds,
        authorIds: form.authorIds,
        coverFile,
        pdfFile,
      });
    } catch (error) {
      console.error(`Error ${isEdit ? 'updating' : 'creating'} book:`, error);
      setServerError(getServerMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorCount = Object.keys(errors).length;
  const price = form.price === '' ? null : Number(form.price);
  const comboboxWrap = (name: FieldName) =>
    `rounded-lg ${shown(name) ? 'ring-1 ring-error' : ''}`;

  return (
    <Modal
      title={isEdit ? 'Chỉnh sửa thông tin sách' : 'Thêm sách mới'}
      onClose={onClose}
      size="xl"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[13rem_1fr]">
          {/* Files */}
          <div
            className={`grid items-start gap-4 md:grid-cols-1 ${isEdit ? 'max-w-[13rem] grid-cols-1' : 'grid-cols-2'
              }`}
          >
            <Field
              name="coverFile"
              label="Ảnh bìa"
              error={shown('coverFile')}
              hint="JPG, PNG, WebP · tối đa 5 MB"
            >
              <FileDropzone
                id="book-cover"
                accept={COVER_ACCEPT}
                file={coverFile}
                onChange={(f) => {
                  setServerError(null);
                  setCoverFile(f);
                  touch('coverFile');
                }}
                previewUrl={previewUrl}
                prompt="Chọn ảnh bìa"
                hint="hoặc kéo thả vào đây"
                hasError={!!shown('coverFile')}
                disabled={isSubmitting}
                className="aspect-[3/4]"
              />
            </Field>

            <Field
              name="pdfFile"
              label="File PDF"
              optional={isEdit}
              error={shown('pdfFile')}
              hint={
                isEdit
                  ? 'Chọn file mới để thay thế · tối đa 100 MB'
                  : 'Tối đa 100 MB'
              }
            >
              <FileDropzone
                id="book-pdf"
                accept=".pdf,application/pdf"
                file={pdfFile}
                onChange={(f) => {
                  setServerError(null);
                  setPdfFile(f);
                  touch('pdfFile');
                }}
                prompt="Chọn file PDF"
                currentFile={currentPdf}
                hasError={!!shown('pdfFile')}
                disabled={isSubmitting}
                className="h-24"
              />
            </Field>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <Field
              name="title"
              label="Tiêu đề"
              htmlFor="book-title"
              error={shown('title')}
            >
              <input
                id="book-title"
                type="text"
                value={form.title}
                onChange={(e) => update({ title: e.target.value })}
                onBlur={() => touch('title')}
                maxLength={LIMITS.title}
                aria-invalid={!!shown('title')}
                aria-describedby={shown('title') ? 'title-error' : undefined}
                disabled={isSubmitting}
                className={inputClass(!!shown('title'))}
                placeholder="Nhập tiêu đề sách"
              />
            </Field>

            <Field
              name="description"
              label="Mô tả"
              htmlFor="book-description"
              error={shown('description')}
              hint={`${form.description.length}/${LIMITS.description} ký tự`}
            >
              <textarea
                id="book-description"
                value={form.description}
                onChange={(e) => update({ description: e.target.value })}
                onBlur={() => touch('description')}
                maxLength={LIMITS.description}
                rows={8}
                aria-invalid={!!shown('description')}
                aria-describedby={
                  shown('description') ? 'description-error' : undefined
                }
                disabled={isSubmitting}
                className={`${inputClass(!!shown('description'))} min-h-40 resize-y`}
                placeholder="Tóm tắt nội dung sách"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field
                name="price"
                label="Giá (VNĐ)"
                htmlFor="book-price"
                error={shown('price')}
                hint={
                  price === null
                    ? 'Nhập 0 nếu sách miễn phí'
                    : price === 0
                      ? 'Miễn phí'
                      : formatVnd(price)
                }
              >
                <input
                  id="book-price"
                  type="text"
                  inputMode="numeric"
                  value={form.price}
                  onChange={(e) =>
                    update({
                      price: e.target.value.replace(/\D/g, '').slice(0, 10),
                    })
                  }
                  onBlur={() => touch('price')}
                  aria-invalid={!!shown('price')}
                  aria-describedby={shown('price') ? 'price-error' : undefined}
                  disabled={isSubmitting}
                  className={inputClass(!!shown('price'))}
                  placeholder="Ví dụ: 99000"
                />
              </Field>

              <Field
                name="voiceId"
                label="Giọng đọc"
                htmlFor="book-voice"
                error={shown('voiceId')}
              >
                <select
                  id="book-voice"
                  value={form.voiceId}
                  onChange={(e) => update({ voiceId: Number(e.target.value) })}
                  onBlur={() => touch('voiceId')}
                  aria-invalid={!!shown('voiceId')}
                  aria-describedby={
                    shown('voiceId') ? 'voiceId-error' : undefined
                  }
                  disabled={isSubmitting}
                  className={`${inputClass(!!shown('voiceId'))} bg-surface`}
                >
                  <option value={0}>Chọn giọng đọc</option>
                  {voices.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field
              name="categoryIds"
              label="Danh mục"
              error={shown('categoryIds')}
            >
              <div className={comboboxWrap('categoryIds')}>
                <MultiSelectCombobox
                  options={categories.map((c) => ({ id: c.id, name: c.name }))}
                  selectedIds={form.categoryIds}
                  onChange={(ids) => {
                    update({ categoryIds: ids });
                    touch('categoryIds');
                  }}
                  placeholder="Tìm kiếm và chọn danh mục..."
                  disabled={isSubmitting}
                />
              </div>
            </Field>

            <Field name="authorIds" label="Tác giả" error={shown('authorIds')}>
              <div className={comboboxWrap('authorIds')}>
                <MultiSelectCombobox
                  options={authors.map((a) => ({
                    id: a.id,
                    name: a.fullName || `Tác giả #${a.id}`,
                  }))}
                  selectedIds={form.authorIds}
                  onChange={(ids) => {
                    update({ authorIds: ids });
                    touch('authorIds');
                  }}
                  placeholder="Tìm kiếm và chọn tác giả..."
                  disabled={isSubmitting}
                />
              </div>
            </Field>
          </div>
        </div>

        <div className="sticky bottom-0 -mb-4 mt-8 border-t border-border bg-surface pb-4 pt-4">
          {serverError && (
            <div
              role="alert"
              className="mb-3 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <p className="text-xs text-error" aria-live="polite">
              {submitAttempted && errorCount > 0
                ? `Còn ${errorCount} trường chưa hợp lệ.`
                : ''}
            </p>
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner />
                    <span>{isEdit ? 'Đang lưu...' : 'Đang tạo...'}</span>
                  </>
                ) : (
                  <span>{isEdit ? 'Lưu thay đổi' : 'Tạo sách'}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
};
