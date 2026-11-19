// Kiểu dữ liệu xác thực và tài khoản
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
}

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export type UserRole = 'ADMIN' | 'CUSTOMER';

/** Hồ sơ trả về từ GET /customer/profile */
export interface CustomerProfile {
  id: number;
  email?: string;
  fullName?: string;
  phone?: string;
  avatarUrl?: string;
}

/** Người dùng đang đăng nhập, lưu ở client */
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
}
