'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import type { BestsellerPeriod, Book, Category } from '@/src/shared/types';
import { ROUTES } from '@/src/shared/constants';
import { ErrorState } from '@/src/presentation/components/common';
import { BookThumbnail } from '@/src/presentation/components/admin/book/BookThumbnail';
import type { Bestsellers } from '@/src/presentation/hooks/admin';
import { formatBookPrice, getApiErrorMessage } from '@/src/shared/utils';
import { Delta, Panel } from './Panel';
import { formatCount, formatPercent } from './format';

/** `during` finishes a sentence ("6 lượt mua …"); `previous` names the window it is compared with. */
const PERIODS: { id: BestsellerPeriod; label: string; during: string; previous: string }[] = [
  { id: 'WEEK', label: '7 ngày qua', during: 'trong 7 ngày qua', previous: '7 ngày trước đó' },
  { id: 'MONTH', label: '30 ngày qua', during: 'trong 30 ngày qua', previous: '30 ngày trước đó' },
  { id: 'QUARTER', label: '3 tháng qua', during: 'trong 3 tháng qua', previous: '3 tháng trước đó' },
  { id: 'YEAR', label: '12 tháng qua', during: 'trong 12 tháng qua', previous: '12 tháng trước đó' },
  { id: 'ALL', label: 'Từ trước đến nay', during: 'từ trước đến nay', previous: '' },
];

const BOOK_ROWS = 5;
const CATEGORY_ROWS = 6;

/** Change against the previous window; nothing for all time, nor when that window had no purchases. */
const Trend: React.FC<{ current: number; previous?: number | null }> = ({ current, previous }) =>
  previous ? <Delta value={current - previous} format={formatCount} className="text-[11px]" /> : null;

const ShowMore: React.FC<{ hidden: number; expanded: boolean; onToggle: () => void; noun: string }> = ({
  hidden,
  expanded,
  onToggle,
  noun,
}) =>
  hidden > 0 ? (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      className="mt-3 text-xs font-medium text-accent hover:underline cursor-pointer"
    >
      {expanded ? 'Thu gọn' : `Xem thêm ${hidden} ${noun}`}
    </button>
  ) : null;

const BookList: React.FC<{ books: Book[] }> = ({ books }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? books : books.slice(0, BOOK_ROWS);
  return (
    <div>
      <ol className="divide-y divide-border-light">
        {visible.map((book, index) => (
          <li key={book.id}>
            <Link
              href={ROUTES.ADMIN.BOOK_DETAIL(book.id)}
              className="group flex items-center gap-3 py-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className="w-5 text-center text-xs font-semibold text-text-muted tabular-nums">{index + 1}</span>
              <BookThumbnail title={book.title} coverImage={book.coverImage?.url} className="w-9 h-12 rounded" iconClassName="w-4 h-4" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-text-primary group-hover:text-accent">{book.title}</span>
                <span className="block text-xs text-text-secondary tabular-nums">{formatBookPrice(book)}</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-semibold text-text-primary tabular-nums">
                  {formatCount(book.purchases ?? 0)} <span className="text-xs font-normal text-text-muted">lượt mua</span>
                </span>
                <Trend current={book.purchases ?? 0} previous={book.previousPurchases} />
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <ShowMore hidden={books.length - BOOK_ROWS} expanded={expanded} onToggle={() => setExpanded((v) => !v)} noun="sách" />
    </div>
  );
};

const CategoryList: React.FC<{ categories: Category[]; total: number }> = ({ categories, total }) => {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? categories : categories.slice(0, CATEGORY_ROWS);
  const max = Math.max(...categories.map((c) => c.purchases ?? 0), 0);
  return (
    <div>
      <ol className="space-y-3.5">
        {visible.map((category) => {
          const purchases = category.purchases ?? 0;
          return (
            <li key={category.id}>
              <div className="flex items-baseline gap-2 text-sm">
                <span className="min-w-0 flex-1 truncate font-medium text-text-primary">{category.name}</span>
                <Trend current={purchases} previous={category.previousPurchases} />
                <span className="w-24 text-right tabular-nums text-text-primary">
                  {formatCount(purchases)}
                  <span className="text-xs text-text-muted"> ({formatPercent(total > 0 ? (purchases / total) * 100 : 0)})</span>
                </span>
              </div>
              <div className="mt-1.5 h-2 rounded-full bg-border-light overflow-hidden" aria-hidden="true">
                <div className="h-full rounded-full bg-accent" style={{ width: `${max > 0 ? (purchases / max) * 100 : 0}%` }} />
              </div>
            </li>
          );
        })}
      </ol>
      <ShowMore
        hidden={categories.length - CATEGORY_ROWS}
        expanded={expanded}
        onToggle={() => setExpanded((v) => !v)}
        noun="thể loại"
      />
    </div>
  );
};

interface BestsellersSectionProps {
  period: BestsellerPeriod;
  onPeriodChange: (period: BestsellerPeriod) => void;
  bestsellers?: Bestsellers;
  error?: unknown;
  isRefreshing: boolean;
  onRetry: () => void;
}

/** What customers bought in a chosen window, and whether each book or category is rising or falling. */
export const BestsellersSection: React.FC<BestsellersSectionProps> = ({
  period,
  onPeriodChange,
  bestsellers,
  error,
  isRefreshing,
  onRetry,
}) => {
  const selected = PERIODS.find((p) => p.id === period) ?? PERIODS[1];
  const trend = bestsellers?.trend;

  return (
    <Panel
      title="Bán chạy"
      description={
        trend
          ? `${formatCount(trend.purchases)} lượt mua ${selected.during}` +
            (trend.previousPurchases != null
              ? ` so với ${formatCount(trend.previousPurchases)} trong ${selected.previous}`
              : '')
          : 'Sách và thể loại được mua nhiều nhất'
      }
      action={
        <label className="flex items-center gap-2 text-xs text-text-secondary">
          <span className="sr-only sm:not-sr-only">Khoảng thời gian</span>
          <select
            value={period}
            onChange={(e) => onPeriodChange(e.target.value as BestsellerPeriod)}
            className="h-9 rounded-lg border border-border bg-surface pl-3 pr-8 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent cursor-pointer"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      }
    >
      <div className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`} aria-busy={!bestsellers || isRefreshing}>
        {error && !bestsellers ? (
          <ErrorState message={getApiErrorMessage(error, 'Chưa tải được danh sách bán chạy.')} onRetry={onRetry} />
        ) : !bestsellers ? (
          <div className="grid gap-6 lg:grid-cols-5" aria-label="Đang tải">
            {['lg:col-span-3', 'lg:col-span-2'].map((span) => (
              <div key={span} className={`space-y-3 ${span}`}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-bg animate-pulse motion-reduce:animate-none" />
                ))}
              </div>
            ))}
          </div>
        ) : bestsellers.trend.purchases === 0 ? (
          <p className="py-8 text-center text-sm text-text-muted">
            Không có lượt mua nào {selected.during}. Thử chọn khoảng thời gian dài hơn.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-6 lg:grid-cols-5">
            <div className="lg:col-span-3 min-w-0">
              <h3 className="mb-1 text-sm font-medium text-text-secondary">Sách</h3>
              <BookList key={period} books={bestsellers.books} />
            </div>
            <div className="lg:col-span-2 min-w-0">
              <h3 className="mb-3 text-sm font-medium text-text-secondary">Thể loại được mua nhiều</h3>
              <CategoryList key={period} categories={bestsellers.categories} total={bestsellers.trend.purchases} />
              <p className="mt-4 text-xs text-text-muted">
                Tỷ lệ tính trên tổng lượt mua trong kỳ. Sách thuộc nhiều thể loại được tính ở từng thể loại.
              </p>
            </div>
          </div>
        )}
      </div>
    </Panel>
  );
};
