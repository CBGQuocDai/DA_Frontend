import { Suspense } from 'react';
import { CustomerRegisterPage } from '@/src/presentation/pages';

export default function Page() {
  return (
    <Suspense>
      <CustomerRegisterPage />
    </Suspense>
  );
}
