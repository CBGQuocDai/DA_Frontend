'use client';

import { use } from 'react';
import { BookDetail } from '@/src/presentation/pages/admin/bookDetail/BookDetail';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <BookDetail bookId={Number(id)} />;
}
