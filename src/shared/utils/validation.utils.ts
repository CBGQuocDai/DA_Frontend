/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
export const isValidPassword = (password: string): boolean => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password)
  );
};

/**
 * Validate phone number (Vietnamese format)
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^(0[3|5|7|8|9])[0-9]{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Get password strength feedback
 */
export const getPasswordStrength = (
  password: string
): { score: number; feedback: string } => {
  let score = 0;
  const feedback: string[] = [];

  if (password.length >= 8) score++;
  else feedback.push('Ít nhất 8 ký tự');

  if (password.length >= 12) score++;

  if (/[A-Z]/.test(password)) score++;
  else feedback.push('Ít nhất 1 chữ hoa');

  if (/[a-z]/.test(password)) score++;
  else feedback.push('Ít nhất 1 chữ thường');

  if (/[0-9]/.test(password)) score++;
  else feedback.push('Ít nhất 1 số');

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else feedback.push('Ít nhất 1 ký tự đặc biệt');

  return {
    score: Math.min(score, 5),
    feedback: feedback.length > 0 ? feedback.join(', ') : 'Mật khẩu mạnh',
  };
};
