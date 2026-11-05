'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Book } from '@/src/shared/types';
import { EmptyState, ScrollButtons } from '@/src/presentation/components/common';
import { BookCard } from './BookCard';
import { BookRowSkeleton } from './BookCardSkeleton';
import styles from './BookShelf.module.css';

const BOOKS_PER_SHELF = 10;

interface BookShelfProps {
  title: React.ReactNode;
  books: Book[];
  isLoading?: boolean;
  /** Rendered next to the title, e.g. a book count. */
  badge?: React.ReactNode;
  /** Destination for the full list with this shelf's filters. */
  viewAllHref?: string;
  /** Additional header actions. */
  actions?: React.ReactNode;
  emptyMessage?: string;
  showStatusBadge?: boolean;
  id?: string;
  className?: string;
}

/** Horizontally scrolling row of book cards with a header and scroll arrows. */
export const BookShelf: React.FC<BookShelfProps> = ({
  title,
  books,
  isLoading = false,
  badge,
  viewAllHref,
  actions,
  emptyMessage = 'Chưa có sách nào',
  showStatusBadge = false,
  id,
  className = '',
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const visibleBooks = books.slice(0, BOOKS_PER_SHELF);
  const [scrollState, setScrollState] = useState({ left: false, right: false });

  useEffect(() => {
    const row = rowRef.current;
    if (!row || isLoading) return;

    const updateScrollState = () => {
      const left = row.scrollLeft > 1;
      const right = row.scrollLeft + row.clientWidth < row.scrollWidth - 1;
      setScrollState((previous) =>
        previous.left === left && previous.right === right ? previous : { left, right }
      );
    };

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(row);
    row.addEventListener('scroll', updateScrollState, { passive: true });
    return () => {
      observer.disconnect();
      row.removeEventListener('scroll', updateScrollState);
    };
  }, [isLoading, visibleBooks.length]);

  const scroll = (direction: 'left' | 'right') => {
    const row = rowRef.current;
    const card = row?.firstElementChild;
    if (!row || !card) return;

    const gap = parseFloat(window.getComputedStyle(row).columnGap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    row.scrollBy({
      left: direction === 'left' ? -step : step,
      behavior: 'smooth',
    });
  };

  return (
    <section id={id} className={`relative ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          {badge}
        </div>
        <div className="flex items-center gap-3">
          {actions}
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-accent transition-colors"
            >
              Xem tất cả
            </Link>
          )}
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
            className={`${styles.row} overflow-x-auto snap-x snap-mandatory scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
          >
            {visibleBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                showStatusBadge={showStatusBadge}
                className="min-w-0 w-full"
              />
            ))}
          </div>
        )}

        {!isLoading && visibleBooks.length > 1 && (scrollState.left || scrollState.right) && (
          <div className={styles.controlsArea}>
            <ScrollButtons
              onScroll={scroll}
              canScrollLeft={scrollState.left}
              canScrollRight={scrollState.right}
              className="absolute -left-2 -right-2 top-1/2 -translate-y-1/2 z-20 sm:-left-4 sm:-right-4"
            />
          </div>
        )}
      </div>
    </section>
  );
};
