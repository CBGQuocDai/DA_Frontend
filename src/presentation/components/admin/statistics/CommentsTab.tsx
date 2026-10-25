'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants';
import { StarRating } from '@/src/presentation/components/common';
import { MOCK_REVIEWS } from './statistics.mock';
import { StatCard } from './StatParts';

const RATING_FILTERS = [null, 5, 4, 3, 2, 1] as const;

export const CommentsTab: React.FC = () => {
  const reviews = MOCK_REVIEWS;
  const [filter, setFilter] = useState<number | null>(null);

  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews;
  const avgRating =
    reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng bình luận" value={reviews.length} sublabel="phản hồi từ người dùng" accent="accent" />
        <StatCard label="Đánh giá TB" value={`${avgRating} / 5`} sublabel="trên toàn nền tảng" accent="amber" />
        <StatCard
          label="5 sao"
          value={reviews.filter((r) => r.rating === 5).length}
          sublabel="bình luận tích cực"
          accent="success"
        />
        <StatCard
          label="Dưới 3 sao"
          value={reviews.filter((r) => r.rating < 3).length}
          sublabel="cần chú ý"
          accent="error"
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Lọc theo sao:</span>
        {RATING_FILTERS.map((value) => (
          <button
            key={String(value)}
            type="button"
            onClick={() => setFilter(value)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === value
                ? value === null
                  ? 'bg-accent text-white'
                  : 'bg-amber-100 text-amber-700'
                : 'bg-bg text-text-secondary hover:text-text-primary'
            }`}
          >
            {value === null ? 'Tất cả' : `★ ${value}`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-text-muted">Không có bình luận nào phù hợp</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div
              key={review.id}
              className="bg-surface rounded-xl border border-border p-5 hover:border-border-light transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold shrink-0">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{review.userName}</p>
                    <p className="text-xs text-text-muted">{review.createdAt}</p>
                  </div>
                </div>
                <StarRating value={review.rating} />
              </div>
              <p className="mt-3 text-sm text-text-primary leading-relaxed">{review.comment}</p>
              <Link
                href={ROUTES.ADMIN.BOOK_DETAIL(review.bookId)}
                className="mt-3 inline-block text-xs text-accent hover:underline"
              >
                Xem sách #{review.bookId}
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
