'use client';

import React from 'react';
import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from 'lucide-react';
import type { useAudioPlayer } from '@/src/presentation/hooks/common';
import styles from './AudioPlayerBar.module.css';

interface AudioPlaybackControlsProps {
  player: ReturnType<typeof useAudioPlayer>;
  canPlay: boolean;
  canSeek: boolean;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  expanded?: boolean;
  isChangingChapter?: boolean;
}

const buttonClass = `${styles.iconButton} flex shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-accent-light hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`;

export const AudioPlaybackControls: React.FC<AudioPlaybackControlsProps> = ({
  player, canPlay, canSeek, onPreviousChapter, onNextChapter, expanded = false, isChangingChapter = false,
}) => (
  <div className={`${styles.transportControls} ${expanded ? styles.largeControls : ''}`}>
    <button type="button" onClick={() => player.skip(-10)} disabled={!canSeek} className={buttonClass} aria-label="Lùi 10 giây" title="Lùi 10 giây">
      <span className="relative flex h-7 w-7 items-center justify-center">
        <RotateCcw className="h-7 w-7" />
        <span className="absolute top-2.5 text-[9px] font-bold leading-none">10</span>
      </span>
    </button>
    <button type="button" onClick={onPreviousChapter} disabled={!onPreviousChapter || isChangingChapter} aria-busy={isChangingChapter} className={buttonClass} aria-label="Chương trước" title="Chương trước">
      <SkipBack className="h-6 w-6" fill="currentColor" />
    </button>
    <button
      type="button"
      onClick={player.togglePlay}
      disabled={!canPlay}
      className={`${styles.playButton} flex shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/20 ring-4 ring-accent/10 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
      aria-label={player.isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
    >
      {player.isPlaying ? <Pause className="h-6 w-6" fill="currentColor" /> : <Play className="ml-0.5 h-6 w-6" fill="currentColor" />}
    </button>
    <button type="button" onClick={onNextChapter} disabled={!onNextChapter || isChangingChapter} aria-busy={isChangingChapter} className={buttonClass} aria-label="Chương tiếp theo" title="Chương tiếp theo">
      <SkipForward className="h-6 w-6" fill="currentColor" />
    </button>
    <button type="button" onClick={() => player.skip(10)} disabled={!canSeek} className={buttonClass} aria-label="Tiến 10 giây" title="Tiến 10 giây">
      <span className="relative flex h-7 w-7 items-center justify-center">
        <RotateCw className="h-7 w-7" />
        <span className="absolute top-2.5 text-[9px] font-bold leading-none">10</span>
      </span>
    </button>
  </div>
);
