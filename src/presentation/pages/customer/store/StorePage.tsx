'use client';

import React, { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CustomerLayout } from '@/src/presentation/layouts';
import { useCategoryShelves } from '@/src/presentation/hooks/customer';
import {
  ALL_CATEGORIES,
  CategoryShelves,
  CategoryTabs,
  SearchResults,
  categorySectionId,
} from '@/src/presentation/components/customer/store';

// Leaves room for the sticky header when jumping to a category
const HEADER_OFFSET_PX = 85;

const parseFilterId = (value: string | null) => {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : undefined;
};

export const CustomerStorePage: React.FC = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('search')?.trim() ?? '';
  const categoryId = parseFilterId(searchParams.get('category'));
  const authorId = parseFilterId(searchParams.get('author'));
  const showResults = Boolean(keyword || categoryId || authorId || searchParams.get('view') === 'all');
  const [activeTab, setActiveTab] = useState(ALL_CATEGORIES);
  // Fetch shelf previews only when they are visible.
  const { shelves, isLoading, error, reload } = useCategoryShelves(!showResults);

  const jumpToCategory = (id: string) => {
    setActiveTab(id);
    if (id === ALL_CATEGORIES) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const section = document.getElementById(categorySectionId(id));
    if (section) {
      const top = section.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET_PX;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <CustomerLayout>
      <div className="space-y-10 pb-16">
        <section className="pt-2">
          <div className="pb-4 border-b border-slate-200">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Sách nói</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thưởng thức các tác phẩm audio bản quyền chất lượng cao cùng giọng đọc truyền cảm
            </p>
          </div>
          {!showResults && (
            <CategoryTabs
              categories={shelves.map((shelf) => shelf.category)}
              activeId={activeTab}
              onSelect={jumpToCategory}
            />
          )}
        </section>

        {showResults ? (
          <SearchResults keyword={keyword} categoryId={categoryId} authorId={authorId} />
        ) : (
          <CategoryShelves shelves={shelves} isLoading={isLoading} error={error} onRetry={reload} />
        )}
      </div>
    </CustomerLayout>
  );
};
