'use client';

import React from 'react';
import { Lock, Pause, Play } from 'lucide-react';
import type { Chapter } from '@/src/shared/types';
import { formatListeningTime } from '@/src/shared/utils';
import { DetailSection } from './DetailSection';
import { Pagination } from '@/src/presentation/components/common';

interface ChapterGridProps {
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
  /** Chapters that are free only because they are part of the preview. */
  isPreviewChapter: (index: number) => boolean;
  activeChapterId: number | null;
  isPlaying: boolean;
  onPlay: (chapter: Chapter, index: number) => void;
  onLocked: () => void;
}

export const ChapterGrid: React.FC<ChapterGridProps> = ({
  chapters,
  total,
  page,
  pageSize,
  totalPage,
  isLoading,
  error,
  onRetry,
  onPageChange,
  isChapterUnlocked,
  isPreviewChapter,
  activeChapterId,
  isPlaying,
  onPlay,
  onLocked,
}) => (
  <DetailSection
    title="Danh sách chương"
    aside={
      <span className="text-xs text-slate-500 font-semibold bg-slate-100 px-3 py-1 rounded-full">
        {total} chương
      </span>
    }
  >
    {isLoading ? (
      <div role="status" aria-label="Đang tải danh sách chương" className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: pageSize }, (_, index) => (
          <div key={index} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    ) : error ? (
      <div role="alert" className="text-sm text-red-600">
        <p>{error}</p>
        <button type="button" onClick={onRetry} className="mt-2 font-semibold text-accent hover:underline">
          Thử lại
        </button>
      </div>
    ) : chapters.length === 0 ? (
      <p className="text-sm text-slate-500">{total === 0 ? 'Sách chưa có chương nào.' : 'Trang này không có chương.'}</p>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {chapters.map((chapter, index) => {
          const globalIndex = page * pageSize + index;
          const isUnlocked = isChapterUnlocked(globalIndex);
          const isActive = chapter.id === activeChapterId;
          const handleClick = () => (isUnlocked ? onPlay(chapter, globalIndex) : onLocked());

          return (
            <div
              key={chapter.id}
              className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-all ${
                isActive
                  ? 'bg-accent-light/70 border-rose-300 shadow-sm'
                  : isUnlocked
                    ? 'bg-white hover:bg-slate-50 border-slate-200/90 hover:border-slate-300 shadow-sm'
                    : 'bg-slate-50/60 border-slate-200/70'
              }`}
            >
              <button type="button" onClick={handleClick} className="flex-1 min-w-0 pr-2 text-left">
                <h3
                  className={`text-xs sm:text-sm font-semibold truncate ${
                    isUnlocked ? 'text-slate-900 hover:text-accent' : 'text-slate-500'
                  }`}
                  title={chapter.title}
                >
                  {chapter.title || `Chương ${globalIndex + 1}`}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {chapter.duration ? (
                    <span className="text-[11px] text-slate-400">{formatListeningTime(chapter.duration)}</span>
                  ) : null}
                  {isPreviewChapter(globalIndex) && (
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 rounded">
                      Miễn phí
                    </span>
                  )}
                </div>
              </button>

              <button
                type="button"
                onClick={handleClick}
                className={`w-9 h-9 flex-shrink-0 rounded-full flex items-center justify-center border transition-all ${
                  !isUnlocked
                    ? 'bg-slate-100 text-slate-400 hover:text-accent hover:bg-accent-light border-slate-200'
                    : isActive
                      ? 'bg-accent text-white border-accent shadow-md shadow-accent/30 scale-105'
                      : 'bg-accent-light text-accent hover:bg-accent hover:text-white border-rose-200'
                }`}
                aria-label={isUnlocked ? 'Phát chương' : 'Chương bị khóa, mua sách để mở khóa'}
              >
                {!isUnlocked ? (
                  <Lock className="w-4 h-4" />
                ) : isActive && isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    )}
    {!isLoading && !error && chapters.length > 0 && (
      <p className="mt-4 text-center text-xs text-slate-500" aria-live="polite">
        Hiển thị {page * pageSize + 1}–{page * pageSize + chapters.length} / {total} chương
      </p>
    )}
    {totalPage > 1 && <Pagination page={page} totalPage={totalPage} onPageChange={onPageChange} />}
  </DetailSection>
);
