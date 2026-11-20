const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const isValidEmail = (email: string) => EMAIL_PATTERN.test(email.trim());

export const MIN_PASSWORD_LENGTH = 6;
/** Cùng giới hạn trên với ChangePasswordRequest phía backend */
export const MAX_PASSWORD_LENGTH = 100;
