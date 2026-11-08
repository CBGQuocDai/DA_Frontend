import type { Metadata } from 'next';
import { CustomerAuthorsPage } from '@/src/presentation/pages';

export const metadata: Metadata = {
  title: 'Tác giả | AudioBook',
  description: 'Khám phá các tác giả tiêu biểu và những tác phẩm sách nói chọn lọc.',
};

export default function Page() {
  return <CustomerAuthorsPage />;
}
