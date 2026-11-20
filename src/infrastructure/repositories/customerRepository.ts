import type { CustomerRepository } from '@/src/application/customer/customerAccount.ports';
import type { CustomerProfile } from '@/src/domain/customer/account';
import type { CustomerProfileResponse } from '@/src/shared/types/auth.types';
import { decodeJwt } from '@/src/shared/utils/jwt.utils';
import { authService } from '@/src/infrastructure/api/services/auth.service';
import { customerService } from '@/src/infrastructure/api/services/customer.service';
import { uploadService } from '@/src/infrastructure/api/services/upload.service';

const requestConfig = (token: string, signal?: AbortSignal) => ({
  headers: { Authorization: `Bearer ${token}` }, signal,
});

const toProfile = (response: CustomerProfileResponse): CustomerProfile => ({
  id: String(response.id),
  email: response.email,
  fullName: response.fullName,
  phone: response.phone,
  avatar: response.avatarUrl || undefined,
});

export const customerRepository: CustomerRepository<File> = {
  login: async (credentials) => {
    const { accessToken } = await customerService.login(credentials);
    const payload = decodeJwt(accessToken);
    return {
      accessToken,
      user: {
        id: payload?.sub ?? '', email: payload?.email || credentials.email,
        fullName: 'Khách hàng', role: 'CUSTOMER',
      },
    };
  },
  register: customerService.register,
  getProfile: async (token) => toProfile(await customerService.getProfile(requestConfig(token))),
  uploadImage: (image, token, signal) => uploadService.uploadCustomerImage(image, { accessToken: token, signal }),
  updateAvatar: async (path, token, signal) => toProfile(await customerService.updateAvatar(path, requestConfig(token, signal))),
  logout: authService.logout,
};
