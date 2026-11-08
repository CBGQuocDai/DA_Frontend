'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export interface PaginationProps {
  /** Zero-based current page */
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const getPageItems = (page: number, totalPage: number): (number | 'ellipsis')[] => {
  if (totalPage <= 7) return Array.from({ length: totalPage }, (_, i) => i);

  const items: (number | 'ellipsis')[] = [0];
  if (page > 2) items.push('ellipsis');
  for (let i = Math.max(1, page - 1); i <= Math.min(totalPage - 2, page + 1); i++) {
    items.push(i);
  }
  if (page < totalPage - 3) items.push('ellipsis');
  items.push(totalPage - 1);
  return items;
};

export const Pagination: React.FC<PaginationProps> = ({ page, totalPage, onPageChange, className = 'mt-6' }) => {
  const items = getPageItems(page, totalPage);

  return (
    <nav aria-label="Phân trang" className={`flex flex-wrap items-center justify-center gap-1 sm:gap-2 ${className}`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Trang trước"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      {items.map((item, i) =>
        item === 'ellipsis' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => onPageChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`min-w-9 h-9 px-1 rounded-md text-sm font-medium transition-colors ${
              item === page ? 'bg-accent text-white' : 'text-text-secondary hover:bg-bg'
            }`}
          >
            {item + 1}
          </button>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPage - 1}
        aria-label="Trang sau"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  );
};
