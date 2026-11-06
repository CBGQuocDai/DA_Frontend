'use client';

import { useCallback, useEffect, useState } from 'react';
import { authorService } from '@/src/infrastructure/api/services';
import type { CustomerAuthorSort } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils/error.utils';
import { useAsyncData } from '../common';

export const useAuthorList = (keyword: string, sort: CustomerAuthorSort, pageSize = 8) => {
  const search = keyword.trim();
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryKey = JSON.stringify([search, sort, pageSize]);
  const [pageState, setPageState] = useState({ queryKey, page: 0 });
  const page = pageState.queryKey === queryKey ? pageState.page : 0;
  const load = useCallback(
    () => authorService.getCustomerPage({ keyword: debouncedSearch || undefined, sort, page, size: pageSize }),
    [debouncedSearch, sort, page, pageSize]
  );
  const { data, error, isLoading, reload } = useAsyncData(load);
  const isPending = isLoading || search !== debouncedSearch;
  const goToPage = (nextPage: number) => {
    if (nextPage >= 0 && nextPage < (data?.totalPage ?? 0)) setPageState({ queryKey, page: nextPage });
  };

  return {
    authors: isPending ? [] : data?.content ?? [],
    total: data?.total ?? 0,
    totalPage: data?.totalPage ?? 0,
    page,
    isLoading: isPending,
    error: !isPending && error ? getApiErrorMessage(error, 'Không thể tải danh sách tác giả. Vui lòng thử lại.') : null,
    goToPage,
    reload,
  };
};
