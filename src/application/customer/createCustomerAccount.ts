import { CustomerAccountError, mergeCustomerProfile, type RegisterRequest, type User } from '@/src/domain/customer/account';
import { validateAvatar, type AvatarImage } from '@/src/domain/customer/avatar';
import type { CustomerRepository, CustomerSessionStorage } from './customerAccount.ports';

/** Các use case nhận repository/storage qua interface, không phụ thuộc React, Axios hay localStorage. */
export const createCustomerAccount = <TImage extends AvatarImage>(
  repository: CustomerRepository<TImage>,
  storage: CustomerSessionStorage,
) => {
  let revision = 0;
  let loginAttempt = 0;
  let pendingRefresh: { token: string; revision: number; promise: Promise<User | null> } | null = null;

  const invalidate = () => {
    ++revision;
    pendingRefresh = null;
  };
  const isCurrent = (token: string, expectedRevision: number) =>
    storage.getToken() === token && revision === expectedRevision;
  const sessionChanged = () => new CustomerAccountError('Phiên đăng nhập đã thay đổi. Vui lòng thử lại.');

  const refreshProfile = (): Promise<User | null> => {
    const token = storage.getToken();
    const user = storage.getUser();
    if (!token || !user) return Promise.resolve(null);
    if (pendingRefresh?.token === token && pendingRefresh.revision === revision) return pendingRefresh.promise;

    const expectedRevision = revision;
    const promise = repository.getProfile(token)
      .then((profile) => isCurrent(token, expectedRevision) ? storage.saveUser(mergeCustomerProfile(user, profile)) : null)
      .catch(() => { storage.notify(); return null; })
      .finally(() => { if (pendingRefresh?.promise === promise) pendingRefresh = null; });
    pendingRefresh = { token, revision: expectedRevision, promise };
    return promise;
  };

  const login = async (email: string, password: string): Promise<User> => {
    const attempt = ++loginAttempt;
    invalidate();
    const { accessToken, user } = await repository.login({ email, password });
    if (attempt !== loginAttempt) throw sessionChanged();
    storage.begin(accessToken, user);
    invalidate();
    const expectedRevision = revision;
    let nextUser = user;
    try {
      nextUser = mergeCustomerProfile(user, await repository.getProfile(accessToken));
    } catch {
      // Có thể đăng nhập khi profile tạm thời lỗi; lần refresh sau sẽ đồng bộ lại.
    }
    if (!isCurrent(accessToken, expectedRevision)) throw sessionChanged();
    return storage.saveUser(nextUser);
  };

  const updateAvatar = async (image: TImage, signal?: AbortSignal): Promise<User> => {
    const error = validateAvatar(image);
    if (error) throw new CustomerAccountError(error);
    const token = storage.getToken();
    const user = storage.getUser();
    if (!token || !user) throw sessionChanged();
    invalidate();
    const expectedRevision = revision;
    const assertCurrent = () => {
      signal?.throwIfAborted();
      if (!isCurrent(token, expectedRevision)) throw sessionChanged();
    };
    try {
      assertCurrent();
      const path = await repository.uploadImage(image, token, signal);
      assertCurrent();
      const profile = await repository.updateAvatar(path, token, signal);
      assertCurrent();
      // GET bắt đầu trong lúc upload cũng không được khôi phục ảnh cũ sau khi lưu.
      invalidate();
      return storage.saveUser(mergeCustomerProfile(user, profile));
    } finally {
      if (storage.getToken() !== token) storage.notify();
    }
  };

  return {
    getSnapshot: storage.getUser,
    subscribe: (onChange: () => void) => storage.subscribe(onChange, () => { ++loginAttempt; invalidate(); }),
    login,
    register: async (data: RegisterRequest) => {
      await repository.register(data);
      return login(data.email, data.password);
    },
    refreshProfile,
    updateAvatar,
    logout: () => {
      const token = storage.getToken();
      ++loginAttempt;
      invalidate();
      storage.clear();
      if (token) void repository.logout(token).catch(() => undefined);
    },
  };
};
