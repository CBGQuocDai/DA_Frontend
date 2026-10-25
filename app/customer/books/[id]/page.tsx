import { BookDetailPage } from '@/src/presentation/pages';
import { Suspense } from 'react';

export default function Page() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Đang tải thông tin sách...</div>}>
      <BookDetailPage />
    </Suspense>
  );
}
