'use client';

import { useCallback } from 'react';
import { customerBookService } from '@/src/infrastructure/api/services';
import { useAsyncData } from '../common';
import { useCustomerAuth } from './useCustomerAuth';

const HOME_BOOKS_LIMIT = 10;

/** Guest discovery uses public recommendations; signed-in customers keep the existing newest shelf. */
export const useHomeBooks = () => {
  const { isAuthenticated, isReady } = useCustomerAuth();
  const load = useCallback(async () => {
    if (!isReady) return [];
    if (!isAuthenticated) return customerBookService.getRecommendations(HOME_BOOKS_LIMIT);
    const page = await customerBookService.getBooks({ page: 0, size: HOME_BOOKS_LIMIT });
    return page.content;
  }, [isReady, isAuthenticated]);
  const { data, error, isLoading, reload } = useAsyncData(load);

  return {
    books: data ?? [],
    isGuest: !isAuthenticated,
    isLoading: !isReady || isLoading,
    error: error ? 'Không thể tải danh sách sách. Vui lòng thử lại.' : null,
    reload,
  };
};
