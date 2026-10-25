import { Suspense } from 'react';
import { CustomerLoginPage } from '@/src/presentation/pages';

export default function Page() {
  return (
    <Suspense>
      <CustomerLoginPage />
    </Suspense>
  );
}
