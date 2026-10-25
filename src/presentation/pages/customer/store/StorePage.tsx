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

export const CustomerStorePage: React.FC = () => {
  const searchParams = useSearchParams();
  const keyword = searchParams.get('search')?.trim() ?? '';
  const [activeTab, setActiveTab] = useState(searchParams.get('category') || ALL_CATEGORIES);
  // Shelves are hidden while searching, so don't fetch them
  const { shelves, isLoading, error, reload } = useCategoryShelves(!keyword);

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
          {!keyword && (
            <CategoryTabs
              categories={shelves.map((shelf) => shelf.category)}
              activeId={activeTab}
              onSelect={jumpToCategory}
            />
          )}
        </section>

        {keyword ? (
          <SearchResults keyword={keyword} />
        ) : (
          <CategoryShelves shelves={shelves} isLoading={isLoading} error={error} onRetry={reload} />
        )}
      </div>
    </CustomerLayout>
  );
};
