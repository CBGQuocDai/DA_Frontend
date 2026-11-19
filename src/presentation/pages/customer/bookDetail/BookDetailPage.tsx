'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Breadcrumb, ChapterAttachmentsPdfViewer, ErrorState } from '@/src/presentation/components/common';
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
import { useListeningProgress } from '@/src/presentation/hooks/customer/useListeningProgress';

/** The first chapters can be listened to before buying the book. */
const FREE_PREVIEW_CHAPTERS = 3;

export const CustomerBookDetailPage: React.FC<{ bookId: number }> = ({ bookId }) => {
  const {
    book, chapters, chapterCount, totalDuration, isLoading,
    isBookNotFound, bookError, reloadOverview,
    isChaptersLoading, chaptersError, reloadChapters,
    chapterPlayback, playbackState,
  } = useCustomerBookDetail(bookId);
  const { user, isAuthenticated, isReady } = useCustomerAuth();
  const payment = useBookPayment(bookId, isAuthenticated);
  const favorite = useBookFavorite(bookId, user?.id, isReady);
  const reviews = useBookReviews(bookId, user?.role === 'CUSTOMER' ? user.id : undefined, isReady);
  const related = useRelatedBooks(book);
  const activeChapter = playbackState.current?.chapter ?? null;
  const activeChapterIndex = playbackState.current?.index ?? -1;
  const progress = useListeningProgress(bookId, user?.role === 'CUSTOMER' ? user.id : undefined);
  const session = progress.session;
  const activeId = activeChapter?.id;
  const activeDuration = activeChapter?.duration;
  const restorePosition = useCallback(() => session && activeId != null && activeDuration
    ? session.restore(activeId, activeDuration) : Promise.resolve(0), [session, activeId, activeDuration]);
  const savePosition = useCallback((position: number, complete: boolean) => {
    if (activeId == null || !activeDuration || activeDuration <= 0) return;
    const seconds = Math.min(complete ? Math.ceil(position) : Math.floor(position), activeDuration);
    session?.checkpoint(activeId, activeChapterIndex, seconds, complete);
  }, [session, activeId, activeChapterIndex, activeDuration]);
  const player = useAudioPlayer({
    trackKey: `${bookId}:${activeId ?? ''}:${user?.id ?? 'guest'}:${activeChapter?.audioUrl ?? ''}`,
    restorePosition: session ? restorePosition : undefined,
    restoreAvailable: !session || progress.progress !== null,
    onCheckpoint: session ? savePosition : undefined,
  });
  const pausePlayer = player.pause;
  const savedChapters = useMemo(() => new Map(
    (progress.progress?.chapters ?? []).map((chapter) => [chapter.chapterId, chapter]),
  ), [progress.progress?.chapters]);
  // Chương đang mở mục tệp đính kèm; audio vẫn phát tiếp trong lúc xem
  const [attachmentsChapter, setAttachmentsChapter] = useState<Chapter | null>(null);

  // Invalidate an in-flight chapter change when the book, rights or mounted page changes.
  useEffect(() => () => chapterPlayback.cancelNavigation(), [chapterPlayback, payment.isPurchased]);
  useEffect(() => () => {
    pausePlayer();
    chapterPlayback.close();
  }, [chapterPlayback, user?.id, pausePlayer]);

  if (isLoading || !book) {
    return <CustomerLayout>{isLoading ? <BookDetailSkeleton /> : isBookNotFound
      ? <BookDetailNotFound />
      : <ErrorState message={bookError} onRetry={reloadOverview} />}</CustomerLayout>;
  }

  const authorName = getBookAuthorNames(book);
  const categories = getBookCategories(book);
  const price = getBookPrice(book) ?? 0;

  const isChapterUnlocked = (index: number) => payment.isPurchased || index < FREE_PREVIEW_CHAPTERS;
  const isPreviewChapter = (index: number) => !payment.isPurchased && index < FREE_PREVIEW_CHAPTERS;
  const navigationOptions = {
    isUnlocked: isChapterUnlocked,
    onLocked: () => { void payment.openPayment(); },
    beforeChange: player.pause,
  };

  const playChapter = (chapter: Chapter, index: number) => {
    if (payment.isCheckingOwnership || index < 0 || index >= chapterCount) return;
    if (!isChapterUnlocked(index)) {
      void payment.openPayment();
      return;
    }
    chapterPlayback.cancelNavigation();
    if (chapter.id === activeChapter?.id) player.togglePlay();
    else void chapterPlayback.open(chapter.id, navigationOptions);
  };

  const navigateChapter = (direction: 'previous' | 'next') => {
    void chapterPlayback.navigate(direction, navigationOptions);
  };

  const closePlayer = () => {
    player.pause();
    chapterPlayback.close();
  };

  const startListening = () => {
    payment.closePayment();
    if (activeChapter) {
      if (!player.isPlaying) player.togglePlay();
      return;
    }
    void chapterPlayback.open(async () => {
      const saved = await session?.prepareResume();
      return saved?.resume?.chapterId ?? null;
    }, navigationOptions);
  };

  const retryProgress = async () => {
    try {
      await session?.reload();
      await player.restore();
      await session?.flush(true);
    } catch { /* The progress session displays the error. */ }
  };
  const progressMessage = player.isRestoring ? 'Đang khôi phục vị trí nghe…' : progress.error ? 'Chưa đồng bộ tiến trình'
    : progress.isSaving ? 'Đang lưu vị trí nghe…'
    : activeId != null && savedChapters.has(activeId) ? 'Đã lưu vị trí nghe' : null;

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
          onPreview={startListening}
          listenLabel={progress.progress?.isBookComplete ? 'Nghe lại' : progress.progress?.hasProgress ? 'Nghe tiếp' : undefined}
          isListeningBusy={progress.isLoading || isChaptersLoading || payment.isCheckingOwnership || playbackState.isNavigating || player.isRestoring}
          onBuy={payment.openPayment}
          onViewReviews={scrollToReviews}
          reviewSummary={reviews.summary}
          isReviewSummaryLoading={reviews.isSummaryLoading}
        />

        {progress.error && (
          <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <span>{progress.error}</span>
            <button type="button" className="font-semibold underline" onClick={() => { void retryProgress(); }}>Thử lại</button>
          </div>
        )}
        {isReady && !isAuthenticated && (
          <p className="text-sm text-slate-500"><Link href={ROUTES.CUSTOMER.LOGIN_THEN(ROUTES.CUSTOMER.BOOK_DETAIL(bookId))} className="font-semibold text-accent hover:underline">Đăng nhập</Link> để lưu vị trí nghe trên tài khoản.</p>
        )}
        {playbackState.error && !activeChapter && <p role="alert" className="text-sm text-red-600">{playbackState.error}</p>}

        <BookIntroduction description={book.description} tags={categories.map((category) => category.name)} />

        <ChapterGrid
          chapters={chapters}
          total={chapterCount}
          isLoading={isChaptersLoading}
          error={chaptersError}
          onRetry={reloadChapters}
          progress={savedChapters}
          isAccessLoading={payment.isCheckingOwnership}
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

        {(related.isLoading || related.error || related.books.length > 0) && (
          <DetailSection title={related.error ? 'Sách liên quan' : undefined}>
            {related.error ? (
              <div role="alert">
                <ErrorState message={related.error} onRetry={related.reload} />
              </div>
            ) : (
              <BookShelf title="Sách liên quan" books={related.books} isLoading={related.isLoading} />
            )}
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
            isLoading: isChaptersLoading,
            error: chaptersError,
            onRetry: reloadChapters,
            progress: savedChapters,
            isAccessLoading: payment.isCheckingOwnership,
            isChapterUnlocked,
            onPlay: playChapter,
          }}
          nextBook={related.books[0]}
          isFavorite={favorite.isFavorite}
          isFavoriteBusy={favorite.isBusy}
          onToggleFavorite={favorite.toggle}
          onPreviousChapter={activeChapterIndex > 0 ? () => navigateChapter('previous') : undefined}
          onNextChapter={activeChapterIndex + 1 < chapterCount ? () => navigateChapter('next') : undefined}
          onPlaybackEnd={activeChapterIndex + 1 < chapterCount && isChapterUnlocked(activeChapterIndex + 1) ? () => navigateChapter('next') : undefined}
          progressMessage={progressMessage}
          hasProgressError={Boolean(progress.error)}
          onRetryProgress={() => { void retryProgress(); }}
          isChangingChapter={playbackState.isNavigating}
          chapterNavigationError={playbackState.error ?? player.error}
          showBuyButton={!payment.isPurchased}
          onBuy={payment.openPayment}
          onClose={closePlayer}
          onOpenAttachments={() => setAttachmentsChapter(activeChapter)}
        />
      )}

      {attachmentsChapter ? (
        <ChapterAttachmentsPdfViewer
          bookId={bookId}
          chapterId={attachmentsChapter.id}
          chapterTitle={attachmentsChapter.title}
          onClose={() => setAttachmentsChapter(null)}
        />
      ) : null}

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
