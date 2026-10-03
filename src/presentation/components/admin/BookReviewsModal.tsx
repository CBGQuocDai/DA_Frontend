'use client';

import React, { useState, useMemo } from 'react';
import type { Book, Review } from '@/src/shared/types';
import { Button, Badge } from '@/src/presentation/components/ui';
import { Star, X, MessageSquare, BookOpen, ThumbsUp, Filter } from 'lucide-react';

interface BookReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: Book | null;
}

// Sample review database for books
const DEFAULT_SAMPLE_REVIEWS: Record<number, Review[]> = {
  1: [
    {
      id: 101,
      bookId: 1,
      userId: 1,
      userName: 'Nguyễn Văn An',
      rating: 5,
      comment: 'Cuốn sách rất hay và ý nghĩa. Giọng đọc AI truyền cảm, phát âm rõ ràng, nghe rất thư thái.',
      createdAt: '2026-09-28 14:30',
    },
    {
      id: 102,
      bookId: 1,
      userId: 2,
      userName: 'Trần Thị Mai',
      rating: 5,
      comment: 'Nội dung sâu sắc, nhiều bài học nhân sinh quý giá. Đã nghe hết 14 chương.',
      createdAt: '2026-09-29 09:15',
    },
    {
      id: 103,
      bookId: 1,
      userId: 3,
      userName: 'Lê Hoàng Minh',
      rating: 4,
      comment: 'Chất lượng âm thanh rất tốt, tuy nhiên ở một số đoạn nhịp đọc hơi nhanh một chút.',
      createdAt: '2026-10-01 20:00',
    },
  ],
  2: [
    {
      id: 201,
      bookId: 2,
      userId: 4,
      userName: 'Phạm Quỳnh Chi',
      rating: 5,
      comment: 'Tác phẩm kinh điển, bản sách nói này biên soạn rất mượt và dễ tiếp thu.',
      createdAt: '2026-09-25 11:20',
    },
    {
      id: 202,
      bookId: 2,
      userId: 5,
      userName: 'Vũ Đức Thịnh',
      rating: 4,
      comment: 'Giọng đọc nam trầm ấm rất hợp với văn phong triết lý của sách.',
      createdAt: '2026-09-27 16:45',
    },
  ],
  3: [
    {
      id: 301,
      bookId: 3,
      userId: 6,
      userName: 'Đoàn Thu Hà',
      rating: 5,
      comment: 'Rất đáng nghe cho ai muốn rèn luyện tư duy và quyết định trong công việc!',
      createdAt: '2026-09-20 18:30',
    },
  ],
};

export const BookReviewsModal: React.FC<BookReviewsModalProps> = ({
  isOpen,
  onClose,
  book,
}) => {
  const [starFilter, setStarFilter] = useState<number | null>(null);

  // Retrieve reviews for this book or generate sensible mock if book has rating
  const reviews: Review[] = useMemo(() => {
    if (!book) return [];
    if (DEFAULT_SAMPLE_REVIEWS[book.id]) {
      return DEFAULT_SAMPLE_REVIEWS[book.id];
    }

    // If book has averageRating, generate demo reviews matching the rating
    if (typeof book.averageRating === 'number' && book.averageRating > 0) {
      return [
        {
          id: book.id * 100 + 1,
          bookId: book.id,
          userId: 11,
          userName: 'Hồ Hoàng Khang',
          rating: Math.round(book.averageRating),
          comment: 'Giọng đọc nghe tự nhiên và truyền cảm, nội dung đầy đủ.',
          createdAt: '2026-10-01 10:15',
        },
        {
          id: book.id * 100 + 2,
          bookId: book.id,
          userId: 12,
          userName: 'Bùi Lan Anh',
          rating: 5,
          comment: 'Rất hài lòng với chất lượng sách nói này, mong có thêm nhiều tác phẩm tương tự!',
          createdAt: '2026-09-30 19:40',
        },
      ];
    }

    return [];
  }, [book]);

  const filteredReviews = useMemo(() => {
    if (starFilter === null) return reviews;
    return reviews.filter((r) => r.rating === starFilter);
  }, [reviews, starFilter]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return typeof book?.averageRating === 'number' ? book.averageRating : 0;
    const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [reviews, book]);

  if (!isOpen || !book) return null;

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
              <div className="w-10 h-14 bg-bg border border-border rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                {book.coverImage ? (
                  <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                ) : (
                  <BookOpen className="w-5 h-5 text-text-muted" />
                )}
              </div>
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
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-border text-border'
                    }`}
                  />
                ))}
              </div>
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
              {[5, 4, 3, 2, 1].map((s) => {
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

                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-border text-border'
                          }`}
                        />
                      ))}
                    </div>
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
            <Button variant="secondary" size="sm" onClick={onClose} className="text-xs">
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookReviewsModal;
