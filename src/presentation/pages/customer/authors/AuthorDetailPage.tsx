'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '@/src/presentation/layouts';
import { Breadcrumb, EmptyState, ErrorState, Pagination } from '@/src/presentation/components/common';
import { AuthorOverview } from '@/src/presentation/components/customer/authors/AuthorOverview';
import { BookCard, BookCardSkeleton } from '@/src/presentation/components/customer/book';
import { useAsyncData } from '@/src/presentation/hooks/common';
import { useBookList } from '@/src/presentation/hooks/customer';
import { authorService } from '@/src/infrastructure/api/services';
import { resolveMediaUrl } from '@/src/shared/utils/media.utils';
import { getApiErrorStatus } from '@/src/shared/utils/error.utils';
import { ROUTES } from '@/src/shared/constants';

const PAGE_SIZE = 12;
const GRID_CLASS = 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-6';

export const CustomerAuthorDetailPage = ({ authorId }: { authorId: number }) => {
  const loadAuthor = useCallback(() => authorService.getAuthor(authorId), [authorId]);
  const { data: author, error: authorError, isLoading: authorLoading, reload: reloadAuthor } = useAsyncData(loadAuthor);
  const { books, total, totalPage, page, isLoading, error, goToPage, reload } = useBookList({ authorId, pageSize: PAGE_SIZE });
  const name = author?.fullName || 'Tác giả';

  return (
    <CustomerLayout>
      <div className="space-y-7 pb-10 sm:space-y-8 sm:pb-14">
        <Breadcrumb items={[
          { label: 'Trang chủ', href: ROUTES.CUSTOMER.HOME },
          { label: 'Tác giả', href: ROUTES.CUSTOMER.AUTHORS },
          { label: name },
        ]} />
        {authorLoading ? (
          <div role="status" className="h-64 animate-pulse rounded-2xl bg-white motion-reduce:animate-none"><span className="sr-only">Đang tải tác giả…</span></div>
        ) : authorError && getApiErrorStatus(authorError) !== 404 ? (
          <ErrorState message="Không thể tải thông tin tác giả." onRetry={reloadAuthor} />
        ) : !author ? (
          <EmptyState title="Không tìm thấy tác giả" action={<Link href={ROUTES.CUSTOMER.AUTHORS} className="text-sm font-semibold text-accent">Quay lại danh sách tác giả</Link>} />
        ) : (
          <>
            <AuthorOverview author={{ name, bio: author.bio ?? undefined, portrait: resolveMediaUrl(author.avatar?.url), bookCount: isLoading || error ? null : total }} />
            <section aria-labelledby="author-works-title" aria-busy={isLoading}>
              <div className="mb-7 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h2 id="author-works-title" className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Tác phẩm của {name}</h2>
                    {!isLoading && !error && <span className="text-xs text-slate-500">{total} cuốn sách nói</span>}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">Khám phá các tác phẩm qua những giọng đọc truyền cảm</p>
                </div>
                <span className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-800">Sắp xếp: Mới nhất</span>
              </div>
              {error ? <ErrorState message={error} onRetry={reload} /> : isLoading ? (
                <div className={GRID_CLASS}>{Array.from({ length: 6 }, (_, index) => <BookCardSkeleton key={index} className="min-w-0 w-full" />)}</div>
              ) : books.length === 0 ? (
                <EmptyState title="Chưa có sách nói được xuất bản" description="Các tác phẩm của tác giả sẽ được cập nhật tại đây." />
              ) : (
                <div className={GRID_CLASS}>{books.map((book) => <BookCard key={book.id} book={book} showStatusBadge />)}</div>
              )}
              {!isLoading && !error && totalPage > 1 && <Pagination page={page} totalPage={totalPage} onPageChange={goToPage} />}
            </section>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};
