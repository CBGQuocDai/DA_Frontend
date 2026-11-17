'use client';

import React from 'react';
import type { Category } from '@/src/shared/types';

export const ALL_CATEGORIES = 'all';

interface CategoryTabsProps {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}

const tabClass = (isActive: boolean) =>
  `px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
    isActive
      ? 'bg-accent text-white shadow-sm shadow-accent/30'
      : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300'
  }`;

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ categories, activeId, onSelect }) => (
  <div role="group" aria-label="Lọc theo danh mục" className="flex items-center gap-2 overflow-x-auto py-3 mt-2">
    <button type="button" aria-pressed={activeId === ALL_CATEGORIES} onClick={() => onSelect(ALL_CATEGORIES)} className={tabClass(activeId === ALL_CATEGORIES)}>
      Tất cả
    </button>
    {categories.map((category) => {
      const id = String(category.id);
      return (
        <button key={id} type="button" aria-pressed={activeId === id} onClick={() => onSelect(id)} className={tabClass(activeId === id)}>
          {category.name}
        </button>
      );
    })}
  </div>
);
