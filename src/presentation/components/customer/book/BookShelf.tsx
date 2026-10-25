'use client';

import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import type { Book } from '@/src/shared/types';
import { EmptyState, ScrollButtons } from '@/src/presentation/components/common';
import { BOOK_CARD_WIDTH, BookCard } from './BookCard';
import { BookRowSkeleton } from './BookCardSkeleton';

const SCROLL_STEP_PX = 320;

interface BookShelfProps {
  title: React.ReactNode;
  books: Book[];
  isLoading?: boolean;
  /** Rendered next to the title, e.g. a book count. */
  badge?: React.ReactNode;
  /** Rendered before the scroll buttons, e.g. a "Xem tất cả" link. */
  actions?: React.ReactNode;
  emptyMessage?: string;
  showStatusBadge?: boolean;
  /** Large arrow on the right edge, revealed on hover. */
  showEdgeArrow?: boolean;
  id?: string;
  className?: string;
}

/** Horizontally scrolling row of book cards with a header and scroll arrows. */
export const BookShelf: React.FC<BookShelfProps> = ({
  title,
  books,
  isLoading = false,
  badge,
  actions,
  emptyMessage = 'Chưa có sách nào',
  showStatusBadge = false,
  showEdgeArrow = false,
  id,
  className = '',
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    rowRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_STEP_PX : SCROLL_STEP_PX,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className={`relative group/shelf ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          {books.length > 0 && <ScrollButtons onScroll={scroll} className="hidden sm:flex" />}
        </div>
      </div>

      <div className="relative">
        {isLoading ? (
          <BookRowSkeleton />
        ) : books.length === 0 ? (
          <EmptyState title={emptyMessage} className="py-8" />
        ) : (
          <div
            ref={rowRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showStatusBadge={showStatusBadge}
                className={BOOK_CARD_WIDTH}
              />
            ))}
          </div>
        )}

        {showEdgeArrow && !isLoading && books.length > 3 && (
          <button
            type="button"
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-accent text-slate-700 hover:text-white border border-slate-200 shadow-lg shadow-slate-300/60 items-center justify-center transition-all opacity-0 group-hover/shelf:opacity-100 hover:scale-110 active:scale-95"
            aria-label="Xem tiếp"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </section>
  );
};
