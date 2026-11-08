'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Lock, Pause, Play } from 'lucide-react';
import type { useAudioPlayer } from '@/src/presentation/hooks/common';
import type { Book, Chapter } from '@/src/shared/types';
import { ROUTES } from '@/src/shared/constants';
import { formatListeningTime, getBookAuthorNames, resolveMediaUrl } from '@/src/shared/utils';
import { Pagination } from '@/src/presentation/components/common';
import { BookCover } from '../book';
import { AudioPlaybackControls } from './AudioPlaybackControls';
import styles from './AudioPlayerBar.module.css';

export interface PlayerChapterList {
  chapters: Chapter[];
  total: number;
  page: number;
  pageSize: number;
  totalPage: number;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  onPageChange: (page: number) => void;
  isChapterUnlocked: (index: number) => boolean;
  onPlay: (chapter: Chapter, index: number) => void;
}

interface ExpandedAudioPlayerProps {
  chapter: Chapter;
  bookTitle: string;
  coverImage?: string;
  player: ReturnType<typeof useAudioPlayer>;
  chapterList: PlayerChapterList;
  nextBook?: Book;
  dockHeight: number;
  onBuy: () => void;
  onNavigateBook: () => void;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  isChangingChapter?: boolean;
}

export const ExpandedAudioPlayer: React.FC<ExpandedAudioPlayerProps> = ({
  chapter, bookTitle, coverImage, player, chapterList, nextBook, dockHeight,
  onBuy, onNavigateBook, onPreviousChapter, onNextChapter, isChangingChapter = false,
}) => {
  const panelRef = useRef<HTMLElement>(null);
  const hasAudio = Boolean(resolveMediaUrl(chapter.audioUrl));
  const canSeek = hasAudio && Number.isFinite(player.duration) && player.duration > 0;

  useEffect(() => {
    panelRef.current?.focus({ preventScroll: true });
  }, []);

  return (
    <section
      ref={panelRef}
      tabIndex={-1}
      aria-label={`Đang nghe ${bookTitle}`}
      className={`${styles.expandedPanel} outline-none`}
      style={{ bottom: dockHeight }}
    >
      <div className={styles.expandedContent}>
        <div className={styles.nowPlaying}>
          <div className={styles.coverGlow} aria-hidden="true" />
          <div className={styles.expandedCover}>
            <BookCover title={bookTitle} coverImage={coverImage} />
          </div>
          <div className={styles.nowPlayingInfo}>
            <h2 className="text-xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-2xl lg:text-3xl">{bookTitle}</h2>
            <p className="mt-3 text-xs leading-6 text-slate-500 sm:text-sm">
              <span className="font-semibold text-accent">{player.isPlaying ? 'Đang phát' : 'Đang tạm dừng'}: </span>
              {chapter.title}
            </p>
          </div>
          <AudioPlaybackControls
            player={player}
            canPlay={hasAudio}
            canSeek={canSeek}
            onPreviousChapter={onPreviousChapter}
            onNextChapter={onNextChapter}
            isChangingChapter={isChangingChapter}
            expanded
          />
          {!hasAudio && <p role="status" className="text-xs text-slate-500">Chương này chưa có audio.</p>}
        </div>

        <div className={styles.listeningQueue}>
          <section aria-labelledby="player-chapters-heading">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 id="player-chapters-heading" className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Danh sách chương</h2>
              <span className="shrink-0 rounded-full border border-accent/10 bg-accent-light px-3 py-1 text-[11px] font-bold text-accent">{chapterList.total} chương</span>
            </div>
            <div className={styles.chapterScroller}>
              {chapterList.isLoading ? (
                <div role="status" aria-label="Đang tải danh sách chương" className="space-y-3">
                  {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-slate-200/60" />)}
                </div>
              ) : chapterList.error ? (
                <div role="alert" className="rounded-xl border border-rose-200 bg-white p-5 text-sm text-red-600">
                  <p>{chapterList.error}</p>
                  <button type="button" onClick={chapterList.onRetry} className="mt-3 font-bold text-accent hover:underline">Thử lại</button>
                </div>
              ) : chapterList.chapters.length === 0 ? (
                <p className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">Chưa có chương nào.</p>
              ) : (
                <ol className="space-y-3">
                  {chapterList.chapters.map((item, index) => {
                    const globalIndex = chapterList.page * chapterList.pageSize + index;
                    const isUnlocked = chapterList.isChapterUnlocked(globalIndex);
                    const isActive = item.id === chapter.id;
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => isUnlocked ? chapterList.onPlay(item, globalIndex) : onBuy()}
                          aria-current={isActive ? 'true' : undefined}
                          aria-label={`${isUnlocked ? 'Phát' : 'Mở khóa'} chương ${globalIndex + 1}: ${item.title}`}
                          className={`${styles.chapterItem} ${isActive ? styles.activeChapter : ''}`}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-bold leading-6 sm:text-sm" title={item.title}>{globalIndex + 1}. {item.title}</span>
                            <span className="mt-1 block text-[11px] font-medium text-slate-500">
                              {!isUnlocked ? 'Mua sách để mở khóa' : item.duration ? formatListeningTime(item.duration) : 'Chưa có thời lượng'}
                            </span>
                          </span>
                          <span className={`${styles.chapterPlayButton} ${isActive ? 'bg-accent text-white' : 'bg-white text-accent'}`}>
                            {!isUnlocked ? <Lock className="h-4 w-4" /> : isActive && player.isPlaying ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
            {!chapterList.isLoading && !chapterList.error && chapterList.totalPage > 1 && (
              <Pagination page={chapterList.page} totalPage={chapterList.totalPage} onPageChange={chapterList.onPageChange} />
            )}
          </section>

          {nextBook && (
            <section aria-labelledby="player-next-heading" className="mt-8 sm:mt-10">
              <h2 id="player-next-heading" className="mb-5 text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">Tiếp theo</h2>
              <Link href={ROUTES.CUSTOMER.BOOK_DETAIL(nextBook.id)} onClick={onNavigateBook} className="group flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm transition-colors hover:border-accent/30 hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-accent">
                <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg shadow-sm"><BookCover title={nextBook.title} coverImage={nextBook.coverImage?.url} /></div>
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 text-xs font-bold leading-6 text-slate-900 group-hover:text-accent sm:text-sm">{nextBook.title}</h3>
                  <p className="mt-1 truncate text-[11px] text-slate-500">{getBookAuthorNames(nextBook)}</p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent"><ArrowRight className="h-4 w-4" /></span>
              </Link>
            </section>
          )}
        </div>
      </div>
    </section>
  );
};
