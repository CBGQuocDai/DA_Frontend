'use client';

import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button, Modal, Spinner } from '@/src/presentation/components/common';
import { authService } from '@/src/infrastructure/api/services';
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, getApiErrorMessage } from '@/src/shared/utils';

type Field = 'current' | 'next' | 'confirm';
type Values = Record<Field, string>;

const EMPTY: Values = { current: '', next: '', confirm: '' };

const FIELDS: { key: Field; label: string; autoComplete: string; hint?: string }[] = [
  { key: 'current', label: 'Mật khẩu hiện tại', autoComplete: 'current-password' },
  {
    key: 'next',
    label: 'Mật khẩu mới',
    autoComplete: 'new-password',
    hint: `Từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự, khác mật khẩu hiện tại`,
  },
  { key: 'confirm', label: 'Nhập lại mật khẩu mới', autoComplete: 'new-password' },
];

const validate = (v: Values): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  if (!v.current) errors.current = 'Nhập mật khẩu hiện tại';
  if (!v.next) errors.next = 'Nhập mật khẩu mới';
  else if (v.next.length < MIN_PASSWORD_LENGTH || v.next.length > MAX_PASSWORD_LENGTH)
    errors.next = `Mật khẩu mới cần từ ${MIN_PASSWORD_LENGTH} đến ${MAX_PASSWORD_LENGTH} ký tự`;
  else if (v.next === v.current) errors.next = 'Mật khẩu mới đang trùng mật khẩu hiện tại';
  if (!v.confirm) errors.confirm = 'Nhập lại mật khẩu mới để xác nhận';
  else if (v.confirm !== v.next) errors.confirm = 'Hai lần nhập mật khẩu mới chưa khớp';
  return errors;
};

/* ---------- Password input ---------- */

interface PasswordInputProps {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  hint?: string;
  error?: string;
  disabled: boolean;
  autoFocus?: boolean;
  onChange: (value: string) => void;
}

const PasswordInput = ({ id, label, value, autoComplete, hint, error, disabled, autoFocus, onChange }: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const describedBy = error ? `${id}-error` : capsLock ? `${id}-caps` : hint ? `${id}-hint` : undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
          onBlur={() => setCapsLock(false)}
          autoComplete={autoComplete}
          maxLength={MAX_PASSWORD_LENGTH}
          spellCheck={false}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          disabled={disabled}
          autoFocus={autoFocus}
          className={`h-11 w-full rounded-lg border bg-surface pl-3.5 pr-11 text-sm text-text-primary transition-colors placeholder:text-text-muted focus:outline-none focus:ring-2 disabled:opacity-60 ${
            error
              ? 'border-error focus:border-error focus:ring-error/20'
              : 'border-border hover:border-text-muted/60 focus:border-accent focus:ring-accent/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`}
          aria-pressed={visible}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex w-11 cursor-pointer items-center justify-center rounded-r-lg text-text-muted transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-error">
          {error}
        </p>
      ) : capsLock ? (
        <p id={`${id}-caps`} className="mt-1.5 text-xs font-medium text-warning">
          Caps Lock đang bật
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="mt-1.5 text-xs text-text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
};

/* ---------- Modal ---------- */

interface ChangePasswordModalProps {
  onClose: () => void;
}

/** Signed-in admin's password change; the backend also rejects a wrong current password. */
export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ onClose }) => {
  const [values, setValues] = useState<Values>(EMPTY);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isDone, setIsDone] = useState(false);

  const errors = validate(values);
  const shownErrors = submitAttempted ? errors : {};
  const { current, next } = values;

  const setField = (key: Field) => (value: string) => {
    setServerError(null);
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitAttempted(true);
    setServerError(null);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);
    try {
      await authService.changeAdminPassword({ oldPassword: current, newPassword: next });
      setIsDone(true);
    } catch (error) {
      setServerError(getApiErrorMessage(error, 'Chưa đổi được mật khẩu. Kiểm tra kết nối rồi thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="Đổi mật khẩu" onClose={onClose}>
      {isDone ? (
        <div role="status" className="flex flex-col items-center px-4 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success-light text-success">
            <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-base font-semibold text-text-primary">Đã đổi mật khẩu</p>
          <p className="mt-1 max-w-sm text-sm leading-6 text-text-secondary">
            Phiên hiện tại vẫn giữ nguyên. Lần đăng nhập sau hãy dùng mật khẩu mới.
          </p>
          <Button type="button" onClick={onClose} className="mt-6 h-10 px-6" autoFocus>
            Đóng
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <div className="space-y-5">
            {serverError && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg bg-error-light px-3.5 py-3 text-sm text-error">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{serverError}</span>
              </div>
            )}
            {FIELDS.map(({ key, label, autoComplete, hint }, index) => (
              <PasswordInput
                key={key}
                id={`admin-password-${key}`}
                label={label}
                value={values[key]}
                autoComplete={autoComplete}
                hint={hint}
                error={shownErrors[key]}
                disabled={isSubmitting}
                autoFocus={index === 0}
                onChange={setField(key)}
              />
            ))}
          </div>

          <div className="sticky -bottom-4 -mb-4 mt-6 flex justify-end gap-3 border-t border-border bg-surface py-4">
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              <span>{isSubmitting ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}</span>
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
