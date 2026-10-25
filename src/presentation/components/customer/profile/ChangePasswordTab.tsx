'use client';

import React, { useState } from 'react';
import { authService } from '@/src/infrastructure/api/services';
import { MIN_PASSWORD_LENGTH, getApiErrorMessage } from '@/src/shared/utils';
import { FormNotice, ProfileField, SubmitButton, TabHeader, profileInputClass, type FormMessage } from './ProfileParts';

const validate = (current: string, next: string, confirm: string): string | null => {
  if (!current || !next || !confirm) return 'Vui lòng điền đầy đủ các trường mật khẩu.';
  if (next !== confirm) return 'Mật khẩu mới và xác nhận mật khẩu không trùng khớp.';
  if (next.length < MIN_PASSWORD_LENGTH) return `Mật khẩu mới phải có tối thiểu ${MIN_PASSWORD_LENGTH} ký tự.`;
  return null;
};

export const ChangePasswordTab: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<FormMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate(currentPassword, newPassword, confirmPassword);
    if (error) {
      setMessage({ type: 'error', text: error });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    try {
      await authService.changePassword({ oldPassword: currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: getApiErrorMessage(err, 'Đổi mật khẩu không thành công. Vui lòng thử lại!') });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fields = [
    { label: 'Mật khẩu hiện tại', value: currentPassword, onChange: setCurrentPassword, placeholder: '••••••••', autoComplete: 'current-password' },
    { label: 'Mật khẩu mới', value: newPassword, onChange: setNewPassword, placeholder: `Tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`, autoComplete: 'new-password' },
    { label: 'Xác nhận mật khẩu mới', value: confirmPassword, onChange: setConfirmPassword, placeholder: 'Nhập lại mật khẩu mới', autoComplete: 'new-password' },
  ];

  return (
    <div className="space-y-6 max-w-lg">
      <TabHeader
        eyebrow="Bảo mật tài khoản"
        title="Đổi mật khẩu"
        description="Nên sử dụng mật khẩu mạnh kết hợp chữ hoa, chữ thường và chữ số"
      />

      {message && <FormNotice message={message} />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {fields.map((field) => (
          <ProfileField key={field.label} label={field.label} required>
            <input
              type="password"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              required
              placeholder={field.placeholder}
              autoComplete={field.autoComplete}
              className={profileInputClass}
            />
          </ProfileField>
        ))}

        <div className="pt-3 flex justify-end">
          <SubmitButton isLoading={isSubmitting} loadingText="Đang cập nhật...">
            Cập nhật mật khẩu
          </SubmitButton>
        </div>
      </form>
    </div>
  );
};
