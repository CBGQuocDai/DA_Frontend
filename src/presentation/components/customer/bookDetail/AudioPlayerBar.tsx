'use client';

import React from 'react';
import { Headphones, Pause, Play, X } from 'lucide-react';
import type { useAudioPlayer } from '@/src/presentation/hooks/common';
import type { Chapter } from '@/src/shared/types';
import { formatClock, resolveMediaUrl } from '@/src/shared/utils';

const SKIP_SECONDS = 10;

interface AudioPlayerBarProps {
  chapter: Chapter;
  subtitle: string;
  player: ReturnType<typeof useAudioPlayer>;
  showBuyButton: boolean;
  onBuy: () => void;
  onClose: () => void;
}

/** Sticky bottom player for the chapter being listened to. */
export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  chapter,
  subtitle,
  player,
  showBuyButton,
  onBuy,
  onClose,
}) => {
  const { audioProps, isPlaying, currentTime, duration, togglePlay, skip, seek } = player;
  const src = resolveMediaUrl(chapter.audioUrl);
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    seek((e.clientX - rect.left) / rect.width);
  };

  return (
    <aside
      aria-label="Trình phát âm thanh"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl p-3 sm:p-4"
    >
      {src && <audio key={src} src={src} {...audioProps} />}

      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
          <div className="w-12 h-14 rounded-lg bg-accent text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-accent/30">
            <Headphones className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-slate-900 truncate">{chapter.title}</p>
            <p className="text-[11px] text-slate-500 truncate">{subtitle}</p>
          </div>
        </div>

        {src ? (
          <div className="flex flex-col items-center gap-1.5 w-full sm:max-w-md">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => skip(-SKIP_SECONDS)}
                className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                title="Lùi 10 giây"
              >
                -10s
              </button>
              <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-md shadow-accent/30 hover:scale-105 active:scale-95 transition-all"
                aria-label={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" fill="currentColor" />
                ) : (
                  <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                )}
              </button>
              <button
                type="button"
                onClick={() => skip(SKIP_SECONDS)}
                className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                title="Tiến 10 giây"
              >
                +10s
              </button>
            </div>

            <div className="w-full flex items-center gap-2 text-[10px] text-slate-400 font-mono">
              <span>{formatClock(currentTime)}</span>
              <div
                className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden cursor-pointer"
                onClick={handleSeek}
              >
                <div className="h-full bg-accent rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span>{formatClock(duration)}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">Chương này chưa có audio.</p>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {showBuyButton && (
            <button
              type="button"
              onClick={onBuy}
              className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
            >
              Mua trọn bộ
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Đóng thanh nghe"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
