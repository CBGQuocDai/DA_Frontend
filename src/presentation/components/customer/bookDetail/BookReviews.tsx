'use client';

import React, { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDown, BadgeCheck, CheckCircle2, ChevronDown, LoaderCircle, MessageSquare, PencilLine, Star } from 'lucide-react';
import { StarRating } from '@/src/presentation/components/common';
import type { useBookReviews } from '@/src/presentation/hooks/customer/useBookReviews';
import { ROUTES } from '@/src/shared/constants';
import type { Review, ReviewSort, User } from '@/src/shared/types';

const RATINGS = [5, 4, 3, 2, 1] as const;
const MAX_COMMENT_LENGTH = 1000;
const RATING_LABELS = ['Chọn số sao', 'Rất không hài lòng', 'Không hài lòng', 'Bình thường', 'Hài lòng', 'Rất hài lòng'];
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh',
});

interface BookReviewsProps {
  bookId: number;
  state: ReturnType<typeof useBookReviews>;
  user: User | null;
  isReady: boolean;
  isPurchased: boolean;
  onBuy: () => void;
}

const reviewTimestamp = (review: Review) => {
  const timestamp = Date.parse(review.createdAt ?? '');
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export const BookReviews: React.FC<BookReviewsProps> = ({
  bookId, state, user, isReady, isPurchased, onBuy,
}) => {
  const formId = useId();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const { filter, sort, setFilter, setSort } = state;
  const total = state.summary?.totalReviews ?? 0;
  const average = state.summary?.averageRating ?? 0;
  const canReview = isReady && user?.role === 'CUSTOMER' && isPurchased && state.mine?.hasReviewed === false
    && !state.isMineLoading && !state.mineError && !state.isSubmitting;

  const focusForm = () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    formRef.current?.scrollIntoView({ behavior, block: 'center' });
    if (canReview) textareaRef.current?.focus({ preventScroll: true });
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    if (!canReview) return;
    if (rating === 0) {
      setError('Vui lòng chọn số sao cho cuốn sách.');
      formRef.current?.querySelector<HTMLInputElement>('input[type="radio"]')?.focus();
      return;
    }
    if (!comment.trim()) {
      setError('Vui lòng viết nhận xét của bạn.');
      textareaRef.current?.focus();
      return;
    }
    setError('');
    if (!await state.submit({ rating, comment: comment.trim() })) return;
    setMessage('Đánh giá của bạn đã được gửi.');
    setRating(0);
    setHoverRating(0);
    setComment('');
  };

  return (
    <section id="book-reviews" aria-labelledby={`${formId}-heading`} className="scroll-mt-24 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 id={`${formId}-heading`} className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Đánh giá &amp; nhận xét</h2>
          </div>
          <p className="mt-2 text-sm text-slate-500">Khám phá cảm nhận của độc giả về cuốn sách</p>
        </div>
        <button type="button" onClick={focusForm} className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          <PencilLine className="h-4 w-4" /> Viết đánh giá
        </button>
      </div>

      {state.isSummaryLoading ? (
        <p role="status" className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-500">Đang tải tổng hợp đánh giá…</p>
      ) : state.summaryError ? (
        <div role="alert" className="rounded-xl bg-rose-50 p-5 text-sm text-red-600">{state.summaryError} <button type="button" onClick={state.retrySummary} className="font-semibold underline">Thử lại</button></div>
      ) : <div className="grid gap-6 rounded-xl border border-slate-100 bg-slate-50/70 p-5 sm:grid-cols-[200px_1fr] sm:gap-8 sm:p-6">
        <div className="flex flex-col items-center justify-center border-b border-slate-200 pb-5 sm:border-r sm:border-b-0 sm:pr-8 sm:pb-0">
          <p className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">{average.toFixed(1)}<span className="ml-1 text-base font-medium tracking-normal text-slate-400">/ 5</span></p>
          <div className="mt-3"><StarRating value={average} className="h-5 w-5" /></div>
          <p className="mt-3 text-xs text-slate-500">{total} lượt đánh giá</p>
        </div>
        <div className="flex flex-col justify-center gap-3">
          {RATINGS.map((stars) => {
            const count = state.summary?.distribution[stars] ?? 0;
            return (
              <button key={stars} type="button" onClick={() => setFilter(filter === stars ? 0 : stars)} aria-pressed={filter === stars} aria-label={`Lọc ${stars} sao, ${count} đánh giá`} className={`grid grid-cols-[42px_1fr_28px] items-center gap-3 rounded-md p-1 text-xs transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-accent ${filter === stars ? 'bg-white font-bold text-accent ring-1 ring-rose-200' : 'text-slate-500'}`}>
                <span className="flex items-center gap-1">{stars}<Star className="h-3 w-3 fill-amber-400 text-amber-400" /></span>
                <span aria-hidden="true" className="h-2 overflow-hidden rounded-full bg-slate-200/80"><span className="block h-full rounded-full bg-amber-400 transition-[width]" style={{ width: `${total ? count / total * 100 : 0}%` }} /></span>
                <span className="text-right tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>}

      <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-slate-900">Nhận xét từ độc giả {!state.isLoading && !state.listError && <span className="ml-1 text-sm font-normal text-slate-400">({state.total})</span>}</h3>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Lọc đánh giá theo số sao"
              value={filter}
              onChange={(event) => setFilter(Number(event.target.value))}
              className="w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-xs text-slate-600 outline-accent"
            >
              <option value={0}>Tất cả số sao</option>
              {RATINGS.map((stars) => <option key={stars} value={stars}>{stars} sao</option>)}
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Sắp xếp đánh giá"
              value={sort}
              onChange={(event) => setSort(event.target.value as ReviewSort)}
              className="w-full min-w-0 appearance-none rounded-lg border border-slate-200 bg-white py-2.5 pr-9 pl-3 text-xs text-slate-600 outline-accent"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Đánh giá cao nhất</option>
            </select>
            <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {state.isLoading ? (
          <p role="status" className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500"><LoaderCircle className="h-4 w-4 animate-spin" />Đang tải đánh giá…</p>
        ) : state.items.length === 0 && !state.listError ? (
          <div className="py-10 text-center text-slate-400"><MessageSquare className="mx-auto mb-3 h-8 w-8" /><p className="text-sm">Chưa có đánh giá phù hợp.</p>{filter !== 0 && <button type="button" onClick={() => setFilter(0)} className="mt-3 text-xs font-semibold text-accent hover:underline">Xem tất cả đánh giá</button>}</div>
        ) : state.items.map((review) => (
          <article key={review.id} className="border-b border-slate-100 py-6">
            <div className="flex flex-wrap items-center gap-3">
              <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-100 text-sm font-bold text-rose-700">{review.userName.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || 'B'}</div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900">{review.userName}{user && review.userId === Number(user.id) && <span className="ml-2 text-xs font-medium text-accent">(Bạn)</span>}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <time dateTime={review.createdAt}>{reviewTimestamp(review) ? dateFormatter.format(new Date(review.createdAt!)) : 'Vừa xong'}</time><span aria-hidden="true">·</span><StarRating value={review.rating} className="h-3 w-3" />
                </div>
              </div>
              {review.verifiedPurchase && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700"><BadgeCheck className="h-3.5 w-3.5" />Đã mua sách</span>}
            </div>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-600">{review.comment}</p>
          </article>
        ))}
      </div>
      {state.listError && <p role="alert" className="mt-4 text-center text-sm text-red-600">{state.listError} <button type="button" onClick={state.retryList} className="font-semibold underline">Thử lại</button></p>}
      {!state.isLoading && state.items.length > 0 && <p className="mt-4 text-center text-xs text-slate-400">Hiển thị {state.items.length} / {state.total} đánh giá</p>}
      {state.hasMore && !state.listError && <button type="button" onClick={state.loadMore} disabled={state.isLoading || state.isLoadingMore} className="mx-auto mt-5 flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50">{state.isLoadingMore ? <>Đang tải…<LoaderCircle className="h-3.5 w-3.5 animate-spin" /></> : <>Xem thêm đánh giá<ArrowDown className="h-3.5 w-3.5" /></>}</button>}

      <form ref={formRef} onSubmit={submit} aria-labelledby={`${formId}-title`} className="mt-7 scroll-mt-24 rounded-xl border border-slate-100 bg-slate-50/70 p-5 sm:p-6" noValidate>
        <h3 id={`${formId}-title`} className="text-base font-bold text-slate-900">Chia sẻ đánh giá của bạn</h3>
        <p className="mt-2 text-xs leading-6 text-slate-500">Chỉ người đã mua sách mới có thể gửi đánh giá. Mỗi người được đánh giá một lần cho mỗi cuốn sách.</p>

        {!isReady ? <p className="mt-4 text-sm text-slate-500" role="status">Đang kiểm tra tài khoản…</p> : !user ? (
          <p className="mt-4 text-sm text-slate-600"><Link href={ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.BOOK_DETAIL(bookId))} className="font-semibold text-accent hover:underline">Đăng nhập</Link> để viết đánh giá cho cuốn sách.</p>
        ) : user.role !== 'CUSTOMER' ? (
          <p className="mt-4 text-sm text-slate-600">Vui lòng sử dụng tài khoản khách hàng để đánh giá sách.</p>
        ) : state.isMineLoading ? (
          <p role="status" className="mt-4 text-sm text-slate-500">Đang kiểm tra đánh giá của bạn…</p>
        ) : state.mineError ? (
          <p role="alert" className="mt-4 text-sm text-red-600">{state.mineError} <button type="button" onClick={state.retryMine} className="font-semibold underline">Thử lại</button></p>
        ) : state.mine?.hasReviewed ? (
          <p className="mt-4 flex items-center gap-2 text-sm font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4 shrink-0" />Bạn đã đánh giá cuốn sách này.</p>
        ) : !isPurchased ? (
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-600"><p>Bạn cần sở hữu sách để chia sẻ đánh giá.</p><button type="button" onClick={onBuy} className="font-semibold text-accent hover:underline">Mua sách</button></div>
        ) : null}

        <fieldset disabled={!canReview} className="mt-4 disabled:opacity-50">
          <legend className="sr-only">Chọn số sao đánh giá</legend>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((stars) => (
                <label key={stars} className={canReview ? 'cursor-pointer p-0.5' : 'cursor-not-allowed p-0.5'} onMouseEnter={() => { if (canReview) setHoverRating(stars); }}>
                  <input type="radio" name={`${formId}-rating`} value={stars} checked={rating === stars} onChange={() => { setRating(stars); setError(''); }} className="peer sr-only" />
                  <Star aria-hidden="true" className={`h-8 w-8 rounded transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent ${(hoverRating || rating) >= stars ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
                  <span className="sr-only">{stars} sao</span>
                </label>
              ))}
            </div>
            <span className="text-xs font-medium text-slate-500">{RATING_LABELS[hoverRating || rating]}</span>
          </div>
        </fieldset>
        <label htmlFor={`${formId}-comment`} className="mt-4 block text-xs font-semibold text-slate-700">Nhận xét của bạn</label>
        <textarea ref={textareaRef} id={`${formId}-comment`} value={comment} onChange={(event) => { setComment(event.target.value); setError(''); }} disabled={!canReview} maxLength={MAX_COMMENT_LENGTH} rows={4} placeholder="Bạn cảm nhận thế nào về cuốn sách này?" aria-describedby={`${formId}-feedback`} aria-invalid={Boolean(error || state.submitError)} className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-6 text-slate-700 outline-accent placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100" />
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <button type="submit" disabled={!canReview} className="rounded-xl bg-accent px-5 py-3 text-xs font-bold text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50">{state.isSubmitting ? 'Đang gửi…' : 'Gửi đánh giá'}</button>
          <span className="text-[11px] tabular-nums text-slate-400">{comment.length}/{MAX_COMMENT_LENGTH} ký tự</span>
        </div>
        <div id={`${formId}-feedback`} aria-live="polite" className="mt-3 text-xs leading-6">
          {(error || state.submitError) && <p role="alert" className="text-red-600">{error || state.submitError}</p>}
          {message && <p role="status" className="text-emerald-700">{message}</p>}
        </div>
      </form>
    </section>
  );
};
