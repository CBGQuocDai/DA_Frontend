'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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

export const CustomerLoginPage: React.FC = () => {
  const { login, isAuthenticated, isReady } = useCustomerAuth();
  // Signing in flips `isAuthenticated`, and the redirect hook navigates away
  useAuthRedirect(isAuthenticated, isReady);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAuthForm({ email, password });
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setErrors({
        general: getAuthErrorMessage(err, 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!'),
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <AuthTitle>Đăng nhập</AuthTitle>
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
            setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          disabled={isSubmitting}
          error={errors.email}
        />
        <PasswordField
          label="Mật khẩu"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          disabled={isSubmitting}
          error={errors.password}
          labelAction={
            <Link
              href={ROUTES.CUSTOMER.FORGOT_PASSWORD}
              className="text-xs text-accent hover:text-accent-hover transition-colors font-medium"
            >
              Quên mật khẩu?
            </Link>
          }
        />
        <AuthSubmitButton isLoading={isSubmitting} loadingText="Đang đăng nhập...">
          Đăng nhập
        </AuthSubmitButton>
      </form>

      <AuthSwitchLink prompt="Chưa có tài khoản?" href={ROUTES.CUSTOMER.REGISTER} label="Đăng ký ngay" />
    </AuthLayout>
  );
};
