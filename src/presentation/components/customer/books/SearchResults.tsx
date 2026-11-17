'use client';

import React from 'react';
import Link from 'next/link';
import { Button, EmptyState, ErrorState, Pagination } from '@/src/presentation/components/common';
import { useBookList } from '@/src/presentation/hooks/customer';
import { ROUTES } from '@/src/shared/constants';
import { BookCard, BookCardSkeleton } from '../book';

const PAGE_SIZE = 12;
const GRID_CLASS = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5';

interface SearchResultsProps {
  keyword?: string;
  categoryId?: number;
  categoryName?: string;
  authorId?: number;
  page: number;
  onPageChange: (page: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({ keyword, categoryId, categoryName, authorId, page: currentPage, onPageChange }) => {
  const { books, total, totalPage, page, isLoading, error, goToPage, reload } = useBookList({
    pageSize: PAGE_SIZE,
    bookName: keyword,
    categoryId,
    authorId,
    page: currentPage,
    onPageChange,
  });
  const hasFilters = Boolean(keyword || categoryId || authorId);
  const isPastLastPage = !isLoading && !error && books.length === 0 && page > 0;

  const handlePageChange = (nextPage: number) => {
    goToPage(nextPage);
    document.getElementById('books-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="books-results" aria-labelledby="books-results-title" aria-busy={isLoading} className="scroll-mt-24">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="min-w-0">
          <h2 id="books-results-title" className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight break-words">
            {categoryName ?? (categoryId ? 'Sách theo danh mục' : authorId ? 'Sách cùng tác giả' : 'Tất cả sách')}
          </h2>
          <p role="status" className="mt-1 text-xs leading-5 text-slate-500 break-words">
            {isLoading ? 'Đang tải sách…' : error ? 'Danh sách sách nói' : `${total} cuốn sách`}
            {keyword ? ` · Kết quả cho “${keyword}”` : ''}
          </p>
        </div>
        {hasFilters && (
          <Link href={ROUTES.CUSTOMER.BOOKS} scroll={false} className="shrink-0 text-xs font-semibold text-accent hover:underline">
            Xóa bộ lọc
          </Link>
        )}
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : isLoading ? (
        <div className={GRID_CLASS}>
          {Array.from({ length: PAGE_SIZE }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      ) : isPastLastPage ? (
        <div className="text-center">
          <EmptyState title="Trang này chưa có sách" description="Danh sách sách có thể đã thay đổi. Hãy quay về trang đầu để tiếp tục khám phá." />
          <Button type="button" onClick={() => handlePageChange(0)}>Về trang đầu</Button>
        </div>
      ) : books.length === 0 ? (
        <EmptyState
          title={hasFilters ? 'Không tìm thấy sách phù hợp' : 'Chưa có sách nói'}
          description={hasFilters ? 'Hãy thử từ khóa hoặc bộ lọc khác.' : 'Sách mới sẽ được cập nhật tại đây.'}
        />
      ) : (
        <div className={GRID_CLASS}>
          {books.map((book) => (
            <BookCard key={book.id} book={book} showStatusBadge />
          ))}
        </div>
      )}

      {!isLoading && !error && !isPastLastPage && totalPage > 1 && <Pagination page={page} totalPage={totalPage} onPageChange={handlePageChange} />}
    </section>
  );
};
