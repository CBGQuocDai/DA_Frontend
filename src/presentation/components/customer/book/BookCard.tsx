'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants';
import type { Book } from '@/src/shared/types';
import { formatVnd, getBookAuthorNames, getBookCategories, getBookPrice } from '@/src/shared/utils';
import { BookCover } from './BookCover';

interface BookCardProps {
  book: Book;
  /** Shows "Miễn phí" / "Đã phát hành" in the top-right corner of the cover. */
  showStatusBadge?: boolean;
  className?: string;
}

export const BOOK_CARD_WIDTH = 'w-40 sm:w-48 md:w-52';

export const BookCard: React.FC<BookCardProps> = ({ book, showStatusBadge = false, className = '' }) => {
  const price = getBookPrice(book);
  const priceLabel = price ? formatVnd(price) : 'Miễn phí';
  const author = getBookAuthorNames(book);
  const category = getBookCategories(book)[0]?.name;

  return (
    <Link
      href={ROUTES.CUSTOMER.BOOK_DETAIL(book.id)}
      className={`flex-shrink-0 snap-start group block ${className}`}
    >
      <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-md shadow-slate-200/80 group-hover:shadow-xl group-hover:shadow-accent/15 group-hover:scale-[1.03] transition-all duration-300 relative border border-slate-200/90 bg-slate-100">
        <BookCover
          title={book.title}
          author={author}
          coverImage={book.coverImage}
          className="group-hover:scale-105 transition-transform duration-500"
        />

        {showStatusBadge && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[9px] font-bold text-slate-800 border border-slate-200 shadow-sm">
            {!price ? 'Miễn phí' : book.status === 'PUBLISHED' ? 'Đã phát hành' : 'Mới'}
          </div>
        )}

        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white">
          {priceLabel}
        </div>
      </div>

      <div className="mt-2.5">
        <div
          className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-accent transition-colors"
          title={book.title}
        >
          {book.title}
        </div>
        <div className="text-[11px] text-slate-500 truncate mt-0.5">{author}</div>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
          {book.averageRating ? (
            <span className="text-amber-500 font-bold">★ {book.averageRating.toFixed(1)}</span>
          ) : (
            <span>Chưa có đánh giá</span>
          )}
          {category && (
            <>
              <span>•</span>
              <span className="truncate max-w-[100px] text-slate-500">{category}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
};
