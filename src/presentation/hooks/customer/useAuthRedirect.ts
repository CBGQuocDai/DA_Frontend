'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants';

/** Where to go after signing in: the `?redirect=` path when it is internal, otherwise the customer home. */
export const useAuthRedirect = (isAuthenticated: boolean, isReady: boolean) => {
  const router = useRouter();
  const redirect = useSearchParams().get('redirect');
  const target = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : ROUTES.CUSTOMER.HOME;

  useEffect(() => {
    if (isReady && isAuthenticated) router.replace(target);
  }, [isReady, isAuthenticated, router, target]);

  return target;
};
