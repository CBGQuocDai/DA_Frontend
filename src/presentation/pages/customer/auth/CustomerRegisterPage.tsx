'use client';

import React, { useState } from 'react';
import { AuthLayout } from '@/src/presentation/layouts';
import { useAuthRedirect, useCustomerAuth } from '@/src/presentation/hooks/customer';
import {
  AuthAlert,
  AuthSubmitButton,
  AuthSwitchLink,
  AuthTextField,
  AuthTitle,
  PasswordField,
  getAuthErrorMessage,
  validateAuthForm,
  type AuthFormErrors,
} from '@/src/presentation/components/customer/auth';
import { ROUTES } from '@/src/shared/constants';
import { getApiErrorCode } from '@/src/shared/utils';

const EMAIL_EXISTS_CODE = 4004;

export const CustomerRegisterPage: React.FC = () => {
  const { register, isAuthenticated, isReady } = useCustomerAuth();
  // Registering signs the user in, and the redirect hook navigates away
  useAuthRedirect(isAuthenticated, isReady);

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearError = (field: keyof AuthFormErrors) =>
    setErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm({ email, password, fullName }, true);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await register({ email: email.trim(), password, fullName: fullName.trim() });
    } catch (err) {
      const message = getAuthErrorMessage(err, 'Đăng ký tài khoản không thành công. Vui lòng thử lại sau!');
      if (getApiErrorCode(err) === EMAIL_EXISTS_CODE || message.toLowerCase().includes('email đã tồn tại')) {
        setErrors({
          email: 'Địa chỉ email này đã được sử dụng. Vui lòng chọn email khác.',
          general: 'Email đã tồn tại trên hệ thống.',
        });
      } else {
        setErrors({ general: message });
      }
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthTitle>Đăng ký</AuthTitle>
      {errors.general && <AuthAlert message={errors.general} />}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthTextField
          label="Email"
          type="email"
          placeholder="Nhập địa chỉ email của bạn"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearError('email');
          }}
          disabled={isSubmitting}
          error={errors.email}
        />
        <AuthTextField
          label="Họ tên"
          type="text"
          placeholder="Nhập họ và tên đầy đủ của bạn"
          autoComplete="name"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            clearError('fullName');
          }}
          disabled={isSubmitting}
          error={errors.fullName}
        />
        <PasswordField
          label="Mật khẩu"
          placeholder="Tối thiểu 6 ký tự"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearError('password');
          }}
          disabled={isSubmitting}
          error={errors.password}
        />
        <AuthSubmitButton isLoading={isSubmitting} loadingText="Đang đăng ký...">
          Đăng ký tài khoản
        </AuthSubmitButton>
      </form>

      <AuthSwitchLink prompt="Đã có tài khoản?" href={ROUTES.CUSTOMER.LOGIN} label="Đăng nhập ngay" />
    </AuthLayout>
  );
};
