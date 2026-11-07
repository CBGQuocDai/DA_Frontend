'use client';

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button, Spinner } from '@/src/presentation/components/common';

/** Limits enforced by the backend DTOs (AuthorRequest, CategoryRequest). */
export const CATALOG_LIMITS = {
  name: 255,
  text: 255,
  avatarBytes: 5 * 1024 * 1024,
};

export const inputClass = (hasError: boolean) =>
  `w-full px-3 py-2 bg-bg border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 ${
    hasError
      ? 'border-error focus:border-error focus:ring-error'
      : 'border-border focus:border-accent focus:ring-accent'
  }`;

interface CatalogFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
}

export const CatalogField = ({ id, label, required, error, hint, children }: CatalogFieldProps) => (
  <div>
    <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
      {label}
      {required && <span className="text-error">*</span>}
    </label>
    {children}
    {error ? (
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-error">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-xs text-text-muted">{hint}</p>
    )}
  </div>
);

interface CatalogFormFooterProps {
  serverError: string | null;
  isSubmitting: boolean;
  isEdit: boolean;
  createLabel: string;
  onCancel: () => void;
}

export const CatalogFormFooter = ({
  serverError,
  isSubmitting,
  isEdit,
  createLabel,
  onCancel,
}: CatalogFormFooterProps) => (
  <div className="mt-6 border-t border-border pt-4">
    {serverError && (
      <div
        role="alert"
        className="mb-3 flex items-start gap-2 rounded-lg border border-error/30 bg-error/5 px-3 py-2 text-sm text-error"
      >
        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
        <span>{serverError}</span>
      </div>
    )}
    <div className="flex justify-end gap-3">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
        Hủy
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting && <Spinner />}
        <span>{isEdit ? (isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi') : isSubmitting ? 'Đang tạo...' : createLabel}</span>
      </Button>
    </div>
  </div>
);
