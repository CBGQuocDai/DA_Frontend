import type { CustomerSessionStorage } from '@/src/application/customer/customerAccount.ports';
import type { User } from '@/src/domain/customer/account';
import { STORAGE_KEYS } from '@/src/shared/constants';
import { authStorage } from './authStorage';

const AUTH_CHANGE_EVENT = 'da-auth-change';

export const createCustomerSessionStorage = (): CustomerSessionStorage => {
  let cachedToken: string | null = null;
  let cachedRaw: string | null = null;
  let cachedUser: User | null = null;
  const notify = () => window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

  return {
    getToken: authStorage.getToken,
    getUser: () => {
      const token = authStorage.getToken();
      const raw = token ? authStorage.getRawUser() : null;
      if (token !== cachedToken || raw !== cachedRaw) {
        cachedToken = token;
        cachedRaw = raw;
        try { cachedUser = raw ? JSON.parse(raw) as User : null; } catch { cachedUser = null; }
      }
      // Snapshot giữ nguyên tham chiếu cho đến khi dữ liệu thay đổi (useSyncExternalStore).
      return cachedUser;
    },
    begin: (token, user) => { authStorage.setToken(token); authStorage.setUser(user); },
    saveUser: (user) => { authStorage.setUser(user); notify(); return user; },
    clear: () => { authStorage.clear(); notify(); },
    notify,
    subscribe: (onChange, onExternalChange) => {
      const onStorage = (event: StorageEvent) => {
        if (event.key !== null && event.key !== STORAGE_KEYS.ACCESS_TOKEN && event.key !== STORAGE_KEYS.USER) return;
        onExternalChange();
        onChange();
      };
      window.addEventListener('storage', onStorage);
      window.addEventListener(AUTH_CHANGE_EVENT, onChange);
      return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
      };
    },
  };
};
