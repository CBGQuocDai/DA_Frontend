'use client';

import React, { useState } from 'react';
import { Modal } from '@/src/presentation/components/common';
import { categoryService } from '@/src/infrastructure/api/services';
import type { Category } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';
import { CATALOG_LIMITS, CatalogField, CatalogFormFooter, inputClass } from './catalogForm';

interface CategoryModalProps {
  /** Category to edit; omit to create one. The modal is mounted per open. */
  category?: Category | null;
  /** Prefills the name when creating, e.g. what was typed in the book form's category search */
  initialName?: string;
  onClose: () => void;
  onSuccess: (saved: Category) => void;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ category, initialName = '', onClose, onSuccess }) => {
  const isEdit = Boolean(category);
  const [name, setName] = useState(category?.name ?? initialName);
  const [description, setDescription] = useState(category?.description ?? '');
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const nameError = !name.trim() ? 'Nhập tên thể loại' : undefined;
  const shownNameError = submitAttempted ? nameError : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // The book form's own submit must not fire when this modal sits on top of it
    e.stopPropagation();
    if (isSubmitting) return;
    setSubmitAttempted(true);
    setServerError(null);
    if (nameError) return;

    setIsSubmitting(true);
    try {
      const payload = { name: name.trim(), description: description.trim() };
      const saved = category
        ? await categoryService.updateCategory(category.id, payload)
        : await categoryService.createCategory(payload);
      onSuccess(saved);
      onClose();
    } catch (error) {
      console.error('Error saving category:', error);
      setServerError(
        getApiErrorMessage(error, isEdit ? 'Không lưu được thể loại, thử lại sau' : 'Không tạo được thể loại, thử lại sau'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Sửa thể loại' : 'Thêm thể loại'} onClose={onClose} size="sm">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <CatalogField id="category-name" label="Tên thể loại" required error={shownNameError}>
          <input
            id="category-name"
            type="text"
            value={name}
            onChange={(e) => {
              setServerError(null);
              setName(e.target.value);
            }}
            maxLength={CATALOG_LIMITS.name}
            aria-invalid={Boolean(shownNameError)}
            aria-describedby={shownNameError ? 'category-name-error' : undefined}
            disabled={isSubmitting}
            className={inputClass(Boolean(shownNameError))}
            placeholder="VD: Trinh thám"
            autoFocus
          />
        </CatalogField>

        <CatalogField
          id="category-description"
          label="Mô tả"
          hint={`${description.length}/${CATALOG_LIMITS.text} ký tự`}
        >
          <textarea
            id="category-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={CATALOG_LIMITS.text}
            rows={3}
            disabled={isSubmitting}
            className={`${inputClass(false)} resize-none`}
            placeholder="Thể loại này gồm những sách nào"
          />
        </CatalogField>

        <CatalogFormFooter
          serverError={serverError}
          isSubmitting={isSubmitting}
          isEdit={isEdit}
          createLabel="Thêm thể loại"
          onCancel={onClose}
        />
      </form>
    </Modal>
  );
};
