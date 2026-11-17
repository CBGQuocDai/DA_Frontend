import { Suspense } from 'react';
import { CustomerBooksPage } from '@/src/presentation/pages';

export default function Page() {
  return (
    <Suspense>
      <CustomerBooksPage />
    </Suspense>
  );
}

