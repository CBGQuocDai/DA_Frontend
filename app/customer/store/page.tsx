import { Suspense } from 'react';
import { CustomerStorePage } from '@/src/presentation/pages';

export default function Page() {
  return (
    <Suspense>
      <CustomerStorePage />
    </Suspense>
  );
}
