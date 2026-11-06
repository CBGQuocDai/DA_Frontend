import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CustomerAuthorDetailPage } from '@/src/presentation/pages/customer/authors/AuthorDetailPage';

export const metadata: Metadata = {
  title: 'Tác giả | AudioBook',
  description: 'Thông tin tác giả và các tác phẩm sách nói đã xuất bản.',
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const authorId = Number(id);
  if (!/^\d+$/.test(id) || !Number.isSafeInteger(authorId) || authorId <= 0) notFound();

  return <CustomerAuthorDetailPage key={authorId} authorId={authorId} />;
}
