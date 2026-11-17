'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants';
import { buildBookQuery, parseBookFilters, updateBookFilters, type CustomerBookFilters } from './bookFilters';

export const useBookFilters = () => {
  const router = useRouter();
  const filters = parseBookFilters(useSearchParams());
  const navigate = (next: CustomerBookFilters) => {
    const query = buildBookQuery(next);
    router.push(`${ROUTES.CUSTOMER.BOOKS}${query ? `?${query}` : ''}`, { scroll: false });
  };

  return {
    ...filters,
    updateFilters: (changes: Partial<Omit<CustomerBookFilters, 'page'>>) => navigate(updateBookFilters(filters, changes)),
    goToPage: (page: number) => navigate({ ...filters, page }),
  };
};
