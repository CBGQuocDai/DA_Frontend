import type { User } from '@/src/domain/customer/account';
import { STORAGE_KEYS } from '@/src/shared/constants';
import { storageJson, storageString } from '@/src/shared/utils/storage.utils';

export const authStorage = {
  getToken: () => storageString.get(STORAGE_KEYS.ACCESS_TOKEN),
  getRawUser: () => storageString.get(STORAGE_KEYS.USER),
  setToken: (token: string) => storageString.set(STORAGE_KEYS.ACCESS_TOKEN, token),
  setUser: (user: User) => storageJson.set(STORAGE_KEYS.USER, user),
  clear: () => {
    storageString.remove(STORAGE_KEYS.ACCESS_TOKEN);
    storageString.remove(STORAGE_KEYS.USER);
  },
};
