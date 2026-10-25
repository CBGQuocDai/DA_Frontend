'use client';

import React from 'react';
import Link from 'next/link';
import { Pagination } from '@/src/presentation/components/common';
import { useBookList } from '@/src/presentation/hooks/customer';
import { ROUTES } from '@/src/shared/constants';
import { BookCard, BookCardSkeleton } from '../book';
import { EmptyState, ErrorState } from '@/src/presentation/components/common';

const PAGE_SIZE = 12;
const GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5';

export const SearchResults: React.FC<{ keyword: string }> = ({ keyword }) => {
  const { books, total, totalPage, page, isLoading, error, goToPage, reload } = useBookList({
    pageSize: PAGE_SIZE,
    bookName: keyword,
  });

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
          Kết quả cho “{keyword}”
          {!isLoading && !error && <span className="ml-2 text-xs font-semibold text-slate-400">{total} cuốn</span>}
        </h2>
        <Link href={ROUTES.CUSTOMER.STORE} className="text-xs font-semibold text-slate-500 hover:text-accent">
          Xóa tìm kiếm
        </Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: 6 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState title="Không tìm thấy sách phù hợp" description="Hãy thử từ khóa khác." />
      ) : (
        <div className={GRID_CLASS}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} showStatusBadge />
          ))}
        </div>
      )}

      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} onPageChange={goToPage} />}
    </section>
  );
};
