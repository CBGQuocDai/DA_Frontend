import { CustomerBookDetailPage } from '@/src/presentation/pages';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CustomerBookDetailPage bookId={Number(id)} />;
}
