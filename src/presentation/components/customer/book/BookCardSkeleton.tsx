'use client';

import React from 'react';
import { BOOK_CARD_WIDTH } from './BookCard';
import styles from './BookShelf.module.css';

export const BookCardSkeleton: React.FC<{ className?: string }> = ({ className = BOOK_CARD_WIDTH }) => (
  <div className={`${className} flex-shrink-0 animate-pulse`}>
    <div className="aspect-[3/4.2] w-full rounded-xl bg-slate-200 border border-slate-200" />
    <div className="mt-2.5 space-y-1.5">
      <div className="h-4 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/2" />
    </div>
  </div>
);

export const BookRowSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div className={`${styles.row} overflow-hidden`}>
    {Array.from({ length: count }, (_, i) => (
      <BookCardSkeleton key={i} className="min-w-0 w-full" />
    ))}
  </div>
);
