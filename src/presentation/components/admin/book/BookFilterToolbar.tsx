'use client';

import React from 'react';
import { Plus, RotateCcw } from 'lucide-react';
import { Button, DropSearch, SearchInput } from '@/src/presentation/components/common';
import { bookStatusConfig } from '@/src/presentation/utils/admin';
import type { BookFilters } from '@/src/presentation/hooks/admin';
import type { Author, BookStatus, Category } from '@/src/shared/types';

const STATUS_OPTIONS = Object.entries(bookStatusConfig).map(([value, config]) => ({
  value,
  label: config.label,
}));

interface BookFilterToolbarProps {
  filters: BookFilters;
  hasFilters: boolean;
  categories: Category[];
  authors: Author[];
  onFilterChange: <K extends keyof BookFilters>(key: K, value: BookFilters[K]) => void;
  onReset: () => void;
  onCreate: () => void;
}

export const BookFilterToolbar: React.FC<BookFilterToolbarProps> = ({
  filters,
  hasFilters,
  categories,
  authors,
  onFilterChange,
  onReset,
  onCreate,
}) => (
  <div className="bg-surface rounded-xl border border-border p-3 shadow-sm">
    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
      <SearchInput
        value={filters.keyword}
        onChange={(value) => onFilterChange('keyword', value)}
        placeholder="Tìm kiếm theo tên sách..."
        className="flex-1 min-w-[200px]"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2.5">
        <div className="w-full lg:w-44">
          <DropSearch
            placeholder="Tất cả thể loại"
            searchPlaceholder="Tìm thể loại..."
            allLabel="Tất cả thể loại"
            options={categories.map((category) => ({ value: category.id, label: category.name }))}
            value={filters.categoryId}
            onChange={(value) => onFilterChange('categoryId', value ? Number(value) : null)}
          />
        </div>
        <div className="w-full lg:w-44">
          <DropSearch
            placeholder="Tất cả tác giả"
            searchPlaceholder="Tìm tác giả..."
            allLabel="Tất cả tác giả"
            options={authors.map((author) => ({
              value: author.id,
              label: author.fullName || `Tác giả #${author.id}`,
            }))}
            value={filters.authorId}
            onChange={(value) => onFilterChange('authorId', value ? Number(value) : null)}
          />
        </div>
        <div className="w-full lg:w-40">
          <DropSearch
            placeholder="Tất cả trạng thái"
            searchPlaceholder="Tìm trạng thái..."
            allLabel="Tất cả trạng thái"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(value) => onFilterChange('status', (value ? String(value) : '') as BookStatus | '')}
          />
        </div>
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={onReset}
          className="h-10 px-3 text-xs font-medium text-text-muted hover:text-error hover:bg-error-light/50 border border-border hover:border-error/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
          title="Xóa tất cả bộ lọc"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Đặt lại</span>
        </button>
      )}

      <Button
        onClick={onCreate}
        className="w-full sm:w-auto h-10 px-4 whitespace-nowrap shadow-sm hover:shadow flex-shrink-0"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm sách</span>
      </Button>
    </div>
  </div>
);
