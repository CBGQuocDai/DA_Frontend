'use client';

import { useCallback } from 'react';
import { bookService, categoryService, statisticsService } from '@/src/infrastructure/api/services';
import type { BestsellerPeriod } from '@/src/shared/types';
import { useAsyncData } from '../common';

/** The chart's longest range; shorter ranges are a slice of it, so switching range costs no request. */
const STATISTICS_MONTHS = 12;

const loadStatistics = () => statisticsService.getStatistics(STATISTICS_MONTHS);

/** Overview figures and the last 12 months of revenue. */
export const useStatistics = () => {
  const { data, ...rest } = useAsyncData(loadStatistics, { keepPrevious: true });
  return { statistics: data, ...rest };
};

/** Best-selling books and categories in the period, with all purchases in it. */
export const useBestsellers = (period: BestsellerPeriod) => {
  const load = useCallback(async () => {
    const [books, categories, trend] = await Promise.all([
      bookService.getBestsellers(period),
      categoryService.getBestsellers(period),
      statisticsService.getPurchaseTrend(period),
    ]);
    return { books, categories, trend };
  }, [period]);
  const { data, ...rest } = useAsyncData(load, { keepPrevious: true });
  return { bestsellers: data, ...rest };
};

export type Bestsellers = NonNullable<ReturnType<typeof useBestsellers>['bestsellers']>;
