'use client';

import { useSyncExternalStore } from 'react';
import { customerAccount } from '@/src/composition/customerAccount';

const noopSubscribe = () => () => {};
const getServerSnapshot = () => null;
const isClient = () => true;
const isServer = () => false;

/** Phiên khách hàng dùng chung cho menu, profile và các màn hình cần đăng nhập. */
export const useCustomerAuth = () => {
  const user = useSyncExternalStore(customerAccount.subscribe, customerAccount.getSnapshot, getServerSnapshot);
  const isReady = useSyncExternalStore(noopSubscribe, isClient, isServer);

  return {
    user,
    isAuthenticated: user !== null,
    isReady,
    login: customerAccount.login,
    register: customerAccount.register,
    refreshProfile: customerAccount.refreshProfile,
    logout: customerAccount.logout,
  };
};
