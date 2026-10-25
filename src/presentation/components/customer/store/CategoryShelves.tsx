'use client';

import React from 'react';
import type { CategoryShelf } from '@/src/presentation/hooks/customer';
import { BookRowSkeleton, BookShelf } from '../book';
import { EmptyState, ErrorState } from '@/src/presentation/components/common';

export const categorySectionId = (categoryId: number | string) => `category-${categoryId}`;

interface CategoryShelvesProps {
  shelves: CategoryShelf[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
}

export const CategoryShelves: React.FC<CategoryShelvesProps> = ({ shelves, isLoading, error, onRetry }) => {
  if (isLoading) {
    return (
      <div className="space-y-10 sm:space-y-12">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <div className="h-7 bg-slate-200 rounded w-48 animate-pulse" />
            <BookRowSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={onRetry} className="max-w-md mx-auto" />;

  if (shelves.length === 0) {
    return (
      <EmptyState
        title="Chưa có danh mục sách nào"
        description="Hiện tại hệ thống chưa có danh mục sách nào. Vui lòng quay lại sau!"
      />
    );
  }

  return (
    <div className="space-y-10 sm:space-y-12">
      {shelves.map(({ category, books, total }) => (
        <BookShelf
          key={category.id}
          id={categorySectionId(category.id)}
          title={category.name}
          books={books}
          showStatusBadge
          showEdgeArrow
          emptyMessage={`Chưa có sách nào trong danh mục "${category.name}"`}
          badge={
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
              {total} cuốn
            </span>
          }
        />
      ))}
    </div>
  );
};
