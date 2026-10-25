'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';
import { authService } from '@/src/infrastructure/api/services';
import { STORAGE_KEYS } from '@/src/shared/constants';
import type { RegisterRequest, User } from '@/src/shared/types';
import { decodeJwt, storageString } from '@/src/shared/utils';

const AUTH_CHANGE_EVENT = 'da-auth-change';

const notifyAuthChange = () => window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));

const subscribe = (onChange: () => void) => {
  window.addEventListener('storage', onChange);
  window.addEventListener(AUTH_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onChange);
    window.removeEventListener(AUTH_CHANGE_EVENT, onChange);
  };
};

// The raw string is a stable snapshot; it is parsed in a memo below
const getUserSnapshot = () =>
  storageString.get(STORAGE_KEYS.ACCESS_TOKEN) ? storageString.get(STORAGE_KEYS.USER) : null;

const noopSubscribe = () => () => {};

const mergeProfile = async (user: User): Promise<User> => {
  try {
    const profile = await authService.getCustomerProfile();
    return {
      ...user,
      id: String(profile.id ?? user.id),
      fullName: profile.fullName || user.fullName,
      phone: profile.phone ?? user.phone,
      avatar: profile.avatarUrl || user.avatar,
    };
  } catch {
    return user;
  }
};

/** Customer session backed by localStorage, shared by every component that uses it. */
export const useCustomerAuth = () => {
  const rawUser = useSyncExternalStore(subscribe, getUserSnapshot, () => null);
  const isHydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);

  const user = useMemo<User | null>(() => {
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as User;
    } catch {
      return null;
    }
  }, [rawUser]);

  const saveUser = useCallback((next: User) => {
    authService.storeUser(next);
    notifyAuthChange();
    return next;
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const { accessToken } = await authService.login({ email, password });
      const payload = decodeJwt(accessToken);
      const baseUser: User = {
        id: payload?.sub ?? '',
        email: payload?.email || email,
        fullName: 'Khách hàng',
        role: 'CUSTOMER',
      };
      return saveUser(await mergeProfile(baseUser));
    },
    [saveUser]
  );

  const register = useCallback(
    async (data: RegisterRequest) => {
      await authService.register(data);
      return login(data.email, data.password);
    },
    [login]
  );

  const refreshProfile = useCallback(async () => {
    if (user) saveUser(await mergeProfile(user));
  }, [user, saveUser]);

  const logout = useCallback(() => {
    authService.logout();
    notifyAuthChange();
  }, []);

  return {
    user,
    isAuthenticated: user !== null,
    /** False until the client has read localStorage; don't redirect before then. */
    isReady: isHydrated,
    login,
    register,
    refreshProfile,
    logout,
  };
};
