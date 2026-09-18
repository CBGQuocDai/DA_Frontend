import { CustomerStorePage } from '@/src/presentation/pages';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Đang tải...</div>}>
      <CustomerStorePage />
    </Suspense>
  );
}
