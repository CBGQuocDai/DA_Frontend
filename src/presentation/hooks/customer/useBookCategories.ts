'use client';

import { categoryService } from '@/src/infrastructure/api/services';
import { useAsyncData } from '../common';

export const useBookCategories = () => {
  const { data, isLoading, error, reload } = useAsyncData(categoryService.getCategories);
  return {
    categories: data ?? [],
    isLoading,
    error: error ? 'Không thể tải danh mục sách.' : null,
    reload,
  };
};
