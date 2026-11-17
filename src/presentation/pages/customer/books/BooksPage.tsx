'use client';

import React from 'react';
import { X } from 'lucide-react';
import { CustomerLayout } from '@/src/presentation/layouts';
import { useBookCategories, useBookFilters } from '@/src/presentation/hooks/customer';
import {
  ALL_CATEGORIES,
  CategoryTabs,
  SearchResults,
  BookSearch,
} from '@/src/presentation/components/customer/books';

export const CustomerBooksPage: React.FC = () => {
  const { keyword, categoryId, authorId, page, updateFilters, goToPage } = useBookFilters();
  const { categories, isLoading, error, reload } = useBookCategories();
  const categoryName = categories.find((category) => category.id === categoryId)?.name;

  return (
    <CustomerLayout>
      <div className="space-y-7 pb-16">
        <section aria-label="Khám phá sách nói" className="pt-2">
          <div className="space-y-5 border-b border-slate-200 pb-5">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Sách nói</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Khám phá kho sách nói và tìm cuốn sách phù hợp với bạn.
              </p>
            </div>
            <BookSearch key={keyword} keyword={keyword} onSearch={(value) => updateFilters({ keyword: value })} />
          </div>
          {isLoading ? (
            <div role="status" aria-label="Đang tải danh mục" className="flex gap-2 overflow-hidden py-3 mt-2">
              {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-8 w-28 shrink-0 animate-pulse rounded-full bg-slate-100" />)}
            </div>
          ) : (
            <CategoryTabs
              categories={categories}
              activeId={categoryId ? String(categoryId) : ALL_CATEGORIES}
              onSelect={(id) => updateFilters({ categoryId: id === ALL_CATEGORIES ? undefined : Number(id) })}
            />
          )}
          {error && (
            <p role="alert" className="mt-2 text-sm text-slate-500">
              {error}{' '}
              <button type="button" onClick={reload} className="font-semibold text-accent hover:underline">Thử lại</button>
            </p>
          )}
          {authorId && (
            <button
              type="button"
              onClick={() => updateFilters({ authorId: undefined })}
              aria-label="Bỏ lọc theo tác giả"
              className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Đang lọc theo tác giả <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </section>

        <SearchResults
          keyword={keyword}
          categoryId={categoryId}
          categoryName={categoryName}
          authorId={authorId}
          page={page}
          onPageChange={goToPage}
        />
      </div>
    </CustomerLayout>
  );
};
