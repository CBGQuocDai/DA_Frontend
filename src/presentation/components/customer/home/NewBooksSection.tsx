'use client';

import React from 'react';
import { Pagination } from '@/src/presentation/components/common';
import { useBookList } from '@/src/presentation/hooks/customer';
import { BookShelf } from '../book';
import { ErrorState } from '@/src/presentation/components/common';

const PAGE_SIZE = 8;

export const NewBooksSection: React.FC = () => {
  const { books, total, totalPage, page, isLoading, error, goToPage, reload } = useBookList({
    pageSize: PAGE_SIZE,
  });

  if (error) {
    return (
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">Sách mới</h2>
        <ErrorState message={error} onRetry={reload} />
      </section>
    );
  }

  return (
    <div>
      <BookShelf
        title="Sách mới"
        books={books}
        isLoading={isLoading}
        emptyMessage="Chưa có sách nào trong danh sách"
        badge={
          total > 0 && (
            <span className="px-2.5 py-0.5 rounded-full bg-accent-light text-accent text-xs font-semibold border border-rose-200">
              {total} cuốn
            </span>
          )
        }
        actions={
          totalPage > 1 && (
            <span className="text-xs text-slate-500 font-medium">
              Trang <span className="text-slate-900 font-semibold">{page + 1}</span> / {totalPage}
            </span>
          )
        }
      />
      {totalPage > 1 && <Pagination page={page} totalPage={totalPage} onPageChange={goToPage} />}
    </div>
  );
};
