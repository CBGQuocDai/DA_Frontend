'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CustomerLayout } from '@/src/presentation/layouts';
import { useAudioPlayer } from '@/src/presentation/hooks/common';
import {
  useBookPayment,
  useBookFavorite,
  useBookReviews,
  useCustomerAuth,
  useCustomerBookDetail,
  useRelatedBooks,
} from '@/src/presentation/hooks/customer';
import { BookShelf } from '@/src/presentation/components/customer/book';
import { Breadcrumb } from '@/src/presentation/components/common';
import {
  AudioPlayerBar,
  BookDetailNotFound,
  BookDetailSkeleton,
  BookIntroduction,
  BookOverview,
  BookReviews,
  ChapterGrid,
  DetailSection,
  PaymentModal,
} from '@/src/presentation/components/customer/bookDetail';
import { ROUTES } from '@/src/shared/constants';
import type { Chapter } from '@/src/shared/types';
import { getBookAuthorNames, getBookCategories, getBookPrice } from '@/src/shared/utils';

/** The first chapters can be listened to before buying the book. */
const FREE_PREVIEW_CHAPTERS = 3;

export const CustomerBookDetailPage: React.FC<{ bookId: number }> = ({ bookId }) => {
  const {
    book, chapters, chapterCount, totalDuration, firstChapter, isLoading,
    isChaptersLoading, chaptersError, reloadChapters, page, pageSize, totalPage, goToPage,
  } = useCustomerBookDetail(bookId);
  const { user, isAuthenticated, isReady } = useCustomerAuth();
  const payment = useBookPayment(bookId, isAuthenticated);
  const favorite = useBookFavorite(bookId, user?.id, isReady);
  const reviews = useBookReviews(bookId, user?.role === 'CUSTOMER' ? user.id : undefined, isReady);
  const related = useRelatedBooks(book);
  const player = useAudioPlayer();
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);

  if (isLoading || !book) {
    return <CustomerLayout>{isLoading ? <BookDetailSkeleton /> : <BookDetailNotFound />}</CustomerLayout>;
  }

  const authorName = getBookAuthorNames(book);
  const categories = getBookCategories(book);
  const price = getBookPrice(book) ?? 0;

  const isChapterUnlocked = (index: number) => payment.isPurchased || index < FREE_PREVIEW_CHAPTERS;
  const isPreviewChapter = (index: number) => !payment.isPurchased && index < FREE_PREVIEW_CHAPTERS;

  const playChapter = (chapter: Chapter) => {
    if (chapter.id === activeChapter?.id) player.togglePlay();
    else setActiveChapter(chapter);
  };

  const startListening = () => {
    payment.closePayment();
    if (firstChapter) playChapter(firstChapter);
  };

  const scrollToReviews = () => {
    const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
    document.getElementById('book-reviews')?.scrollIntoView({ behavior, block: 'start' });
  };

  return (
    <CustomerLayout>
      <div className="space-y-10 sm:space-y-12 pb-24">
        <div className="pt-2">
          <Breadcrumb
            items={[
              { label: 'Trang chủ', href: ROUTES.CUSTOMER.HOME },
              { label: 'Sách nói', href: ROUTES.CUSTOMER.STORE },
              ...(categories[0] ? [{ label: categories[0].name }] : []),
              { label: book.title },
            ]}
          />
        </div>

        <BookOverview
          book={book}
          authorName={authorName}
          categoryName={categories[0]?.name}
          price={price}
          chapterCount={chapterCount}
          totalDuration={totalDuration}
          isPurchased={payment.isPurchased}
          isFavorite={favorite.isFavorite}
          isFavoriteBusy={favorite.isBusy}
          favoriteError={favorite.error}
          onToggleFavorite={favorite.toggle}
          onPreview={() => firstChapter && playChapter(firstChapter)}
          onBuy={payment.openPayment}
          onViewReviews={scrollToReviews}
          reviewSummary={reviews.summary}
          isReviewSummaryLoading={reviews.isSummaryLoading}
        />

        <BookIntroduction description={book.description} tags={categories.map((category) => category.name)} />

        <ChapterGrid
          chapters={chapters}
          total={chapterCount}
          page={page}
          pageSize={pageSize}
          totalPage={totalPage}
          isLoading={isChaptersLoading}
          error={chaptersError}
          onRetry={reloadChapters}
          onPageChange={goToPage}
          isChapterUnlocked={isChapterUnlocked}
          isPreviewChapter={isPreviewChapter}
          activeChapterId={activeChapter?.id ?? null}
          isPlaying={player.isPlaying}
          onPlay={playChapter}
          onLocked={payment.openPayment}
        />

        <BookReviews
          key={`${bookId}:${user?.id ?? 'guest'}`}
          bookId={bookId}
          state={reviews}
          user={user}
          isReady={isReady}
          isPurchased={payment.isPurchased}
          onBuy={payment.openPayment}
        />

        {(related.isLoading || related.sameAuthor.length > 0) && (
          <DetailSection>
            <BookShelf title="Cùng tác giả" books={related.sameAuthor} isLoading={related.isLoading} />
          </DetailSection>
        )}

        {(related.isLoading || related.sameCategory.length > 0) && (
          <DetailSection>
            <BookShelf
              title="Đầu sách tương tự"
              books={related.sameCategory}
              isLoading={related.isLoading}
              actions={
                categories[0] && (
                  <Link
                    href={`${ROUTES.CUSTOMER.STORE}?category=${categories[0].id}`}
                    className="text-xs sm:text-sm font-semibold text-slate-500 hover:text-accent transition-colors"
                  >
                    Xem tất cả →
                  </Link>
                )
              }
            />
          </DetailSection>
        )}
      </div>

      {activeChapter && (
        <AudioPlayerBar
          chapter={activeChapter}
          subtitle={`${book.title} • ${authorName}`}
          player={player}
          showBuyButton={!payment.isPurchased}
          onBuy={payment.openPayment}
          onClose={() => setActiveChapter(null)}
        />
      )}

      {payment.isModalOpen && (
        <PaymentModal
          bookTitle={book.title}
          coverImage={book.coverImage?.url}
          price={price}
          chapterCount={chapterCount}
          payment={payment.payment}
          isLoading={payment.isCreating}
          isPaid={payment.isPaid}
          error={payment.error}
          onStartListening={startListening}
          onClose={payment.closePayment}
        />
      )}
    </CustomerLayout>
  );
};
