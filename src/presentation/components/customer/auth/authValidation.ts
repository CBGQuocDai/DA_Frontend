import { MIN_PASSWORD_LENGTH, getApiErrorMessage, getApiErrorStatus, isNetworkError, isValidEmail } from '@/src/shared/utils';

export interface AuthFormValues {
  email: string;
  password: string;
  fullName?: string;
}

export type AuthFormErrors = Partial<Record<keyof AuthFormValues | 'general', string>>;

/** Validates the fields that are present; `fullName` is only checked when `requireFullName` is set. */
export const validateAuthForm = (
  { email, password, fullName = '' }: AuthFormValues,
  requireFullName = false
): AuthFormErrors => {
  const errors: AuthFormErrors = {};

  if (!email.trim()) errors.email = 'Vui lòng nhập địa chỉ email';
  else if (!isValidEmail(email)) errors.email = 'Email không hợp lệ (VD: user@example.com)';

  if (requireFullName) {
    if (!fullName.trim()) errors.fullName = 'Vui lòng nhập họ và tên của bạn';
    else if (fullName.trim().length < 2) errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
  }

  if (!password) errors.password = 'Vui lòng nhập mật khẩu';
  else if (password.length < MIN_PASSWORD_LENGTH)
    errors.password = `Mật khẩu phải có ít nhất ${MIN_PASSWORD_LENGTH} ký tự`;

  return errors;
};

/** Maps a login/register API error to a message for the form. */
export const getAuthErrorMessage = (error: unknown, fallback: string) => {
  if (isNetworkError(error)) return 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau!';
  const status = getApiErrorStatus(error);
  const serverMessage = getApiErrorMessage(error, '');
  if (serverMessage) return serverMessage;
  if (status === 400 || status === 401) return 'Email hoặc mật khẩu không chính xác.';
  if (status === 404) return 'Tài khoản không tồn tại trên hệ thống.';
  return fallback;
};
