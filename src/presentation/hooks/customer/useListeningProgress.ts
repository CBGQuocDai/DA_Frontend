'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createListeningProgressApi } from '@/src/infrastructure/api/services/listenProgress.service';
import { getAccessToken } from '@/src/infrastructure/api/config/interceptor.config';
import { createListeningProgress, type ListeningProgressState } from '@/src/presentation/utils/customer/listeningProgress';

const EMPTY: ListeningProgressState = { progress: null, isLoading: false, isSaving: false, error: null };
const subscribeEmpty = () => () => {};
const getEmpty = () => EMPTY;

export const useListeningProgress = (bookId: number, customerId?: string) => {
  const session = useMemo(() => {
    const token = customerId ? getAccessToken() : null;
    return token ? createListeningProgress(createListeningProgressApi(bookId, token)) : null;
  }, [bookId, customerId]);
  const state = useSyncExternalStore(session?.subscribe ?? subscribeEmpty, session?.getSnapshot ?? getEmpty, getEmpty);

  useEffect(() => {
    if (!session) return;
    const retry = () => {
      void session.reload().then(() => session.flush()).catch(() => {});
    };
    void session.load().catch(() => {});
    const timer = window.setInterval(() => { void session.flush(); }, 10_000);
    window.addEventListener('online', retry);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('online', retry);
      void session.flush();
    };
  }, [session]);

  return { ...state, session };
};
