import type { CustomerProfile, LoginRequest, RegisterRequest, User } from '@/src/domain/customer/account';
import type { AvatarImage } from '@/src/domain/customer/avatar';

export interface CustomerRepository<TImage extends AvatarImage> {
  login(credentials: LoginRequest): Promise<{ accessToken: string; user: User }>;
  register(data: RegisterRequest): Promise<void>;
  getProfile(accessToken: string): Promise<CustomerProfile>;
  uploadImage(image: TImage, accessToken: string, signal?: AbortSignal): Promise<string>;
  updateAvatar(path: string, accessToken: string, signal?: AbortSignal): Promise<CustomerProfile>;
  logout(accessToken: string): Promise<void>;
}

export interface CustomerSessionStorage {
  getToken(): string | null;
  getUser(): User | null;
  begin(accessToken: string, user: User): void;
  saveUser(user: User): User;
  clear(): void;
  notify(): void;
  subscribe(onChange: () => void, onExternalChange: () => void): () => void;
}
