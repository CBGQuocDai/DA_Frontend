'use client';

import React from 'react';
import type { Book } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';
import { Button, ErrorState, Pagination, Spinner, StarRating } from '@/src/presentation/components/common';
import { useAdminBookReviews } from '@/src/presentation/hooks/admin/useAdminBookReviews';
import { Star, X, MessageSquare, Filter } from 'lucide-react';
import { BookThumbnail } from './BookThumbnail';

const STAR_FILTERS = [5, 4, 3, 2, 1] as const;

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

/** "2026-11-14T03:20:00Z" -> "10:20 14/11/2026"; rỗng khi backend không trả thời điểm hợp lệ */
const formatReviewDate = (iso?: string) => {
  const timestamp = Date.parse(iso ?? '');
  return Number.isNaN(timestamp) ? '' : dateFormatter.format(timestamp);
};

interface BookReviewsModalProps {
  book: Book;
  onClose: () => void;
}

/** Admin xem đánh giá của độc giả cho một cuốn sách: điểm trung bình, lọc theo số sao, phân trang. */
export const BookReviewsModal: React.FC<BookReviewsModalProps> = ({ book, onClose }) => {
  const state = useAdminBookReviews(book.id);
  const { summary, reviews, rating } = state;

  const totalReviews = summary?.totalReviews ?? 0;
  const averageRating = summary?.averageRating ?? book.averageRating ?? 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Lớp nền mờ */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
        <div
          className="relative w-full max-w-2xl bg-surface rounded-2xl shadow-2xl border border-border flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Tiêu đề */}
          <div className="px-5 py-4 border-b border-border flex items-center justify-between gap-3 bg-surface flex-shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <BookThumbnail
                title={book.title}
                coverImage={book.coverImage?.url}
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
                  <span className="font-semibold text-text-primary">{totalReviews} đánh giá</span>
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

          {/* Điểm trung bình và bộ lọc theo sao */}
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

            <div className="flex items-center gap-1 flex-wrap text-xs">
              <span className="text-text-muted text-[11px] mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" />
                Lọc:
              </span>
              <button
                type="button"
                onClick={() => state.setRating(null)}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  rating === null
                    ? 'bg-accent text-white shadow-2xs'
                    : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg'
                }`}
              >
                Tất cả ({totalReviews})
              </button>
              {STAR_FILTERS.map((star) => {
                const count = summary?.distribution?.[star] ?? 0;
                return (
                  <button
                    key={star}
                    type="button"
                    // Bấm lại mức sao đang chọn để bỏ lọc
                    onClick={() => state.setRating(star === rating ? null : star)}
                    className={`px-2 py-1 rounded-md font-medium transition-colors inline-flex items-center gap-1 ${
                      rating === star
                        ? 'bg-amber-500 text-white shadow-2xs'
                        : 'bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-bg'
                    }`}
                  >
                    <span>{star}</span>
                    <Star className="w-3 h-3 fill-current" />
                    {count > 0 && <span className="text-[10px] opacity-80">({count})</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Danh sách đánh giá */}
          <div
            className={`flex-1 min-h-0 overflow-y-auto p-5 space-y-3.5 transition-opacity ${state.isRefreshing ? 'opacity-60' : ''}`}
            aria-busy={state.isLoading || state.isRefreshing}
          >
            {state.error && reviews.length === 0 ? (
              <ErrorState
                message={getApiErrorMessage(state.error, 'Chưa tải được đánh giá. Kiểm tra kết nối rồi thử lại.')}
                onRetry={state.reload}
              />
            ) : state.isLoading ? (
              <div className="py-14 flex justify-center text-text-muted">
                <Spinner className="w-6 h-6" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-14 text-center space-y-3">
                <div className="w-12 h-12 bg-bg rounded-full flex items-center justify-center mx-auto text-text-muted">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-semibold text-text-primary">
                  {rating === null
                    ? 'Chưa có bình luận nào cho cuốn sách này'
                    : `Không có đánh giá ${rating} sao nào`}
                </h4>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  {rating === null
                    ? 'Độc giả sẽ để lại nhận xét và đánh giá sao sau khi nghe sách trên ứng dụng.'
                    : 'Hãy chọn mức sao khác hoặc chọn "Tất cả" để xem toàn bộ bình luận.'}
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const createdAt = formatReviewDate(review.createdAt);
                return (
                  <div
                    key={review.id}
                    className="bg-bg/40 border border-border/80 rounded-xl p-4 space-y-2 hover:bg-bg/70 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-accent/15 text-accent font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {(review.userName || '?').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary leading-tight">
                            {review.userName || 'Độc giả'}
                          </p>
                          {createdAt && (
                            <time dateTime={review.createdAt} className="block text-[11px] text-text-muted mt-0.5">
                              {createdAt}
                            </time>
                          )}
                        </div>
                      </div>

                      <StarRating value={review.rating} />
                    </div>

                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed pl-10.5">
                      {review.comment}
                    </p>
                  </div>
                );
              })
            )}
          </div>

          {/* Chân modal: số lượng, phân trang và nút đóng */}
          <div className="px-5 py-3 border-t border-border flex flex-wrap items-center justify-between gap-3 text-xs text-text-muted bg-surface flex-shrink-0">
            <span>Hiển thị {reviews.length} / {state.total} bình luận</span>
            {state.totalPage > 1 && (
              <Pagination page={state.page} totalPage={state.totalPage} onPageChange={state.setPage} className="" />
            )}
            <Button variant="secondary" size="sm" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
