'use client';

import React, { useState } from 'react';
import type { Book } from '@/src/shared/types';
import { Button, StarRating } from '@/src/presentation/components/common';
import { Star, X, MessageSquare, Filter } from 'lucide-react';
import { BookThumbnail } from './BookThumbnail';
import { getSampleReviews } from './reviews.mock';

const STAR_FILTERS = [5, 4, 3, 2, 1];

interface BookReviewsModalProps {
  book: Book;
  onClose: () => void;
}

export const BookReviewsModal: React.FC<BookReviewsModalProps> = ({ book, onClose }) => {
  const [starFilter, setStarFilter] = useState<number | null>(null);

  const reviews = getSampleReviews(book);
  const filteredReviews = starFilter === null ? reviews : reviews.filter((r) => r.rating === starFilter);
  const averageRating =
    reviews.length > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1))
      : book.averageRating ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-surface flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <BookThumbnail
                title={book.title}
                coverImage={book.coverImage}
                className="w-10 h-14 rounded-lg shadow-xs"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight truncate">
                    {book.title || 'Chưa có tiêu đề'}
                  </h3>
                </div>
                <p className="text-xs text-text-secondary mt-0.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-accent" />
                  <span>Bình luận & Đánh giá của độc giả</span>
                  <span className="text-text-muted">•</span>
                  <span className="font-semibold text-text-primary">{reviews.length} đánh giá</span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors flex-shrink-0"
              title="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Rating Summary Bar */}
          <div className="px-5 py-3.5 bg-bg/60 border-b border-border flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-text-primary tracking-tight">
                  {averageRating > 0 ? averageRating.toFixed(1) : 'Chưa có'}
                </span>
                {averageRating > 0 && <span className="text-xs text-text-muted">/ 5</span>}
              </div>
              <StarRating value={averageRating} className="w-4 h-4" />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-1 flex-wrap text-xs">
              <span className="text-text-muted text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Lọc:
              </span>
              <button
                type="button"
                onClick={() => setStarFilter(null)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  starFilter === null
                    ? 'bg-accent text-white shadow-2xs'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg'
                }`}
              >
                Tất cả ({reviews.length})
              </button>
              {STAR_FILTERS.map((s) => {
                const count = reviews.filter((r) => r.rating === s).length;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStarFilter(s === starFilter ? null : s)}
                    className={`px-2 py-1 rounded-md font-medium transition-colors inline-flex items-center gap-1 ${
                      starFilter === s
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg'
                    }`}
                  >
                    <span>{s}</span>
                    <Star className="w-3 h-3 fill-current" />
                    {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-3.5">
            {filteredReviews.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center mx-auto text-text-muted">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary">
                  {starFilter === null
                    ? 'Chưa có bình luận nào cho cuốn sách này'
                    : `Không có đánh giá ${starFilter} sao nào`}
                </h4>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  {starFilter === null
                    ? 'Độc giả sẽ để lại nhận xét và đánh giá sao sau khi nghe sách trên ứng dụng.'
                    : 'Hãy chọn mức sao khác hoặc chọn "Tất cả" để xem toàn bộ bình luận.'}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-bg/40 border border-border/80 rounded-xl p-4 space-y-2 hover:bg-bg/70 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                        {review.userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary leading-tight">
                          {review.userName}
                        </p>
                        {review.createdAt && (
                          <p className="text-[11px] text-text-muted mt-0.5">{review.createdAt}</p>
                        )}
                      </div>
                    </div>

                    <StarRating value={review.rating} />
                  </div>

                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed pl-10.5">
                    {review.comment}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border flex items-center justify-between text-xs text-text-muted bg-surface flex-shrink-0">
            <span>Hiển thị {filteredReviews.length} / {reviews.length} bình luận</span>
            <Button variant="secondary" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
