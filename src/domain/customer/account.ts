export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  fullName: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'ADMIN' | 'CUSTOMER';
}

/** Hồ sơ đã được chuẩn hóa, không chứa tên trường hay kiểu ID riêng của API. */
export interface CustomerProfile {
  id: string;
  email?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
}

export class CustomerAccountError extends Error {}

export const mergeCustomerProfile = (user: User, profile: CustomerProfile): User => ({
  ...user,
  id: profile.id,
  email: profile.email ?? user.email,
  fullName: profile.fullName || user.fullName,
  phone: profile.phone ?? user.phone,
  avatar: profile.avatar,
});
