'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { bookFavoriteService } from '@/src/infrastructure/api/services/bookFavorite.service';
import { ROUTES } from '@/src/shared/constants';
import { getApiErrorCode, getApiErrorMessage, getApiErrorStatus } from '@/src/shared/utils';
import { useAsyncData } from '../common';

interface FavoriteMutation {
  load: () => Promise<boolean>;
  isFavorite?: boolean;
  isUpdating: boolean;
  error: string | null;
}

const isUnauthorized = (error: unknown) =>
  getApiErrorStatus(error) === 401 || getApiErrorCode(error) === 4010;

export const useBookFavorite = (bookId: number, customerId: string | undefined, isReady: boolean) => {
  const router = useRouter();
  const load = useCallback<() => Promise<boolean>>(
    () => customerId ? bookFavoriteService.check(bookId) : Promise.resolve(false),
    [bookId, customerId]
  );
  const generation = useRef(0);
  const pending = useRef<symbol | null>(null);

  // Ignore mutations that finish after leaving the book or changing accounts.
  useEffect(() => {
    generation.current += 1;
    pending.current = null;
    return () => { generation.current += 1; };
  }, [load]);

  const { data, error: checkError, isLoading, reload } = useAsyncData<boolean>(load);
  const [mutation, setMutation] = useState<FavoriteMutation | null>(null);
  const current = mutation?.load === load ? mutation : null;
  const isFavorite: boolean = current?.isFavorite ?? data ?? false;
  const isBusy = !isReady || (Boolean(customerId) && isLoading) || Boolean(current?.isUpdating);
  const error = current?.error || (checkError
    ? getApiErrorMessage(checkError, 'Không thể tải trạng thái yêu thích. Bấm tim để thử lại.')
    : null);

  const toggle = async () => {
    if (isBusy || pending.current) return;
    if (!customerId || isUnauthorized(checkError)) {
      router.push(ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.BOOK_DETAIL(bookId)));
      return;
    }
    if (checkError) {
      reload();
      return;
    }

    const version = generation.current;
    const request = Symbol();
    pending.current = request;
    setMutation({ load, isFavorite, isUpdating: true, error: null });
    try {
      const saved = await bookFavoriteService.toggle(bookId);
      if (generation.current === version) {
        setMutation({ load, isFavorite: saved, isUpdating: false, error: null });
      }
    } catch (err) {
      if (generation.current !== version) return;
      setMutation({
        load,
        isUpdating: false,
        error: getApiErrorMessage(err, 'Không thể cập nhật yêu thích. Vui lòng thử lại.'),
      });
      if (isUnauthorized(err)) {
        router.push(ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.BOOK_DETAIL(bookId)));
      } else {
        // A timeout can happen after the server saved: read before another toggle.
        reload();
      }
    } finally {
      if (pending.current === request) pending.current = null;
    }
  };

  return { isFavorite, isBusy, error, toggle };
};
