// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export type UserRole = 'ADMIN' | 'CUSTOMER';

/** Profile returned by GET /customer/profile */
export interface CustomerProfile {
  id: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

/** Signed-in user kept on the client */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}
