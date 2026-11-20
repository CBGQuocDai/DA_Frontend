export type { LoginRequest, RegisterRequest, User } from '@/src/domain/customer/account';

export interface AuthResponse {
  accessToken: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

/** Hồ sơ trả về từ GET /customer/profile */
export interface CustomerProfileResponse {
  id: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string | null;
}
