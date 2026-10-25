'use client';

import React, { useState } from 'react';
import { Clock, Heart, ListOrdered, Play, ShoppingCart, Star } from 'lucide-react';
import type { Book } from '@/src/shared/types';
import { formatListeningTime, formatVnd } from '@/src/shared/utils';
import { BookCover } from '../book';

interface BookOverviewProps {
  book: Book;
  authorName: string;
  categoryName?: string;
  price: number;
  chapterCount: number;
  totalDuration: number;
  isPurchased: boolean;
  onPreview: () => void;
  onBuy: () => void;
}

export const BookOverview: React.FC<BookOverviewProps> = ({
  book,
  authorName,
  categoryName,
  price,
  chapterCount,
  totalDuration,
  isPurchased,
  onPreview,
  onBuy,
}) => {
  // No favourites API yet, so this only lives for the visit
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <section className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 sm:p-8 md:p-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 lg:gap-12">
        <div className="w-56 sm:w-64 md:w-72 lg:w-80 flex-shrink-0 aspect-[3/4.2] rounded-2xl overflow-hidden shadow-xl shadow-slate-300/60 border border-slate-200/90">
          <BookCover title={book.title} author={authorName} coverImage={book.coverImage} />
        </div>

        <div className="flex-1 min-w-0 text-center md:text-left flex flex-col justify-between self-stretch">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                {book.title}
              </h1>
              <button
                type="button"
                onClick={() => setIsFavorite((value) => !value)}
                className={`p-2.5 rounded-full border transition-all ${
                  isFavorite
                    ? 'bg-accent-light border-rose-200 text-accent shadow-sm'
                    : 'bg-white border-slate-200 text-slate-400 hover:text-accent hover:border-rose-200'
                }`}
                aria-pressed={isFavorite}
                aria-label={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
              >
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
            </div>

            <div className="mt-3 space-y-1 text-sm text-slate-600">
              <p>
                Tác giả: <span className="font-bold text-slate-900">{authorName}</span>
              </p>
              {categoryName && (
                <p>
                  Thể loại: <span className="font-semibold text-accent">{categoryName}</span>
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <ListOrdered className="w-4 h-4 text-accent" />
                <strong className="text-slate-900 font-bold">{chapterCount}</strong> chương
              </span>
              {totalDuration > 0 && (
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-4 h-4 text-accent" />
                  {formatListeningTime(totalDuration)}
                </span>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-2 mt-4 text-xs">
              <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
              {book.averageRating ? (
                <>
                  <span className="font-bold text-slate-900">{book.averageRating.toFixed(1)}</span>
                  <span className="text-slate-400">({book.ratingCount ?? 0} đánh giá)</span>
                </>
              ) : (
                <span className="text-slate-400">Chưa có đánh giá</span>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5">
            <button
              type="button"
              onClick={onPreview}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover hover:from-rose-500 hover:to-accent text-white font-bold text-xs sm:text-sm tracking-wider uppercase flex items-center justify-center gap-2.5 shadow-md shadow-accent/30 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play className="w-4 h-4" fill="currentColor" />
              <span>{isPurchased ? 'Nghe ngay' : 'Nghe thử miễn phí'}</span>
            </button>

            {isPurchased ? (
              <span className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 border-2 bg-emerald-50 border-emerald-500 text-emerald-700">
                ✓ Đã sở hữu sách
              </span>
            ) : (
              <button
                type="button"
                onClick={onBuy}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2.5 border-2 bg-white border-accent text-accent hover:bg-accent-light hover:border-accent-hover hover:scale-[1.02] active:scale-95 transition-all shadow-sm"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Mua sách • {formatVnd(price)}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
