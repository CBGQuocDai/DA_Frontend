'use client';

import { useCallback } from 'react';
import { adminService, bookService, categoryService } from '@/src/infrastructure/api/services';
import type { BestsellerPeriod } from '@/src/shared/types';
import { useAsyncData } from '../common';

/** Khoảng dài nhất của biểu đồ; khoảng ngắn hơn chỉ là một phần của nó nên đổi khoảng không tốn request. */
const STATISTICS_MONTHS = 12;

const loadStatistics = () => adminService.getStatistics(STATISTICS_MONTHS);

/** Số liệu tổng quan và doanh thu 12 tháng gần nhất. */
export const useStatistics = () => {
  const { data, ...rest } = useAsyncData(loadStatistics, { keepPrevious: true });
  return { statistics: data, ...rest };
};

/** Sách và thể loại bán chạy trong kỳ, kèm tổng lượt mua của kỳ đó. */
export const useBestsellers = (period: BestsellerPeriod) => {
  const load = useCallback(async () => {
    const [books, categories, trend] = await Promise.all([
      bookService.getBestsellers(period),
      categoryService.getBestsellers(period),
      adminService.getPurchaseTrend(period),
    ]);
    return { books, categories, trend };
  }, [period]);
  const { data, ...rest } = useAsyncData(load, { keepPrevious: true });
  return { bestsellers: data, ...rest };
};

export type Bestsellers = NonNullable<ReturnType<typeof useBestsellers>['bestsellers']>;
