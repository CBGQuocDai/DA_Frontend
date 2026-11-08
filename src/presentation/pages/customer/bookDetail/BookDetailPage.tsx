'use client';

import React, { useEffect } from 'react';
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
import { getBookAuthorNames, getBookAuthors, getBookCategories, getBookPrice } from '@/src/shared/utils';

/** The first chapters can be listened to before buying the book. */
const FREE_PREVIEW_CHAPTERS = 3;

export const CustomerBookDetailPage: React.FC<{ bookId: number }> = ({ bookId }) => {
  const {
    book, chapters, chapterCount, totalDuration, firstChapter, isLoading,
    isChaptersLoading, chaptersError, reloadChapters, page, pageSize, totalPage, goToPage,
    chapterPlayback, playbackState,
  } = useCustomerBookDetail(bookId);
  const { user, isAuthenticated, isReady } = useCustomerAuth();
  const payment = useBookPayment(bookId, isAuthenticated);
  const favorite = useBookFavorite(bookId, user?.id, isReady);
  const reviews = useBookReviews(bookId, user?.role === 'CUSTOMER' ? user.id : undefined, isReady);
  const related = useRelatedBooks(book);
  const player = useAudioPlayer();
  const activeChapter = playbackState.current?.chapter ?? null;

  // Invalidate an in-flight chapter change when the book, rights or mounted page changes.
  useEffect(() => () => chapterPlayback.cancelNavigation(), [chapterPlayback, payment.isPurchased]);

  if (isLoading || !book) {
    return <CustomerLayout>{isLoading ? <BookDetailSkeleton /> : <BookDetailNotFound />}</CustomerLayout>;
  }

  const authorName = getBookAuthorNames(book);
  const authors = getBookAuthors(book);
  const categories = getBookCategories(book);
  const price = getBookPrice(book) ?? 0;

  const isChapterUnlocked = (index: number) => payment.isPurchased || index < FREE_PREVIEW_CHAPTERS;
  const isPreviewChapter = (index: number) => !payment.isPurchased && index < FREE_PREVIEW_CHAPTERS;
  const activeChapterIndex = playbackState.current?.index ?? -1;

  const playChapter = (chapter: Chapter, index: number) => {
    if (index < 0 || index >= chapterCount) return;
    if (!isChapterUnlocked(index)) {
      void payment.openPayment();
      return;
    }
    if (chapter.id === activeChapter?.id) player.togglePlay();
    else player.pause();
    chapterPlayback.select(chapter, index);
  };

  const navigateChapter = (direction: 'previous' | 'next') => {
    void chapterPlayback.navigate(direction, {
      total: chapterCount,
      isUnlocked: isChapterUnlocked,
      onLocked: () => { void payment.openPayment(); },
      beforeChange: player.pause,
    });
  };

  const closePlayer = () => {
    player.pause();
    chapterPlayback.close();
  };

  const startListening = () => {
    payment.closePayment();
    if (firstChapter) playChapter(firstChapter, 0);
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
          onPreview={() => firstChapter && playChapter(firstChapter, 0)}
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
            <BookShelf
              title="Cùng tác giả"
              books={related.sameAuthor}
              isLoading={related.isLoading}
              viewAllHref={authors[0] ? `${ROUTES.CUSTOMER.STORE}?author=${authors[0].id}` : undefined}
            />
          </DetailSection>
        )}

        {(related.isLoading || related.sameCategory.length > 0) && (
          <DetailSection>
            <BookShelf
              title="Đầu sách tương tự"
              books={related.sameCategory}
              isLoading={related.isLoading}
              viewAllHref={categories[0] ? `${ROUTES.CUSTOMER.STORE}?category=${categories[0].id}` : undefined}
            />
          </DetailSection>
        )}
      </div>

      {activeChapter && (
        <AudioPlayerBar
          chapter={activeChapter}
          bookTitle={book.title}
          coverImage={book.coverImage?.url}
          subtitle={`${book.title} • ${authorName}`}
          player={player}
          chapterList={{
            chapters,
            total: chapterCount,
            page,
            pageSize,
            totalPage,
            isLoading: isChaptersLoading,
            error: chaptersError,
            onRetry: reloadChapters,
            onPageChange: goToPage,
            isChapterUnlocked,
            onPlay: playChapter,
          }}
          nextBook={related.sameCategory[0] ?? related.sameAuthor[0]}
          isFavorite={favorite.isFavorite}
          isFavoriteBusy={favorite.isBusy}
          onToggleFavorite={favorite.toggle}
          onPreviousChapter={activeChapterIndex > 0 ? () => navigateChapter('previous') : undefined}
          onNextChapter={activeChapterIndex + 1 < chapterCount ? () => navigateChapter('next') : undefined}
          isChangingChapter={playbackState.isNavigating}
          chapterNavigationError={playbackState.error}
          showBuyButton={!payment.isPurchased}
          onBuy={payment.openPayment}
          onClose={closePlayer}
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
