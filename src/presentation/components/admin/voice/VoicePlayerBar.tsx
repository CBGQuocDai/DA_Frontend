'use client';

import React from 'react';
import { Mic, Pause, Play, X } from 'lucide-react';
import type { Voice } from '@/src/shared/types';
import { formatClock } from '@/src/shared/utils';

interface VoicePlayerBarProps {
  voice: Voice;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  onSeek: (fraction: number) => void;
  onClose: () => void;
}

/** Player docked under the voice table while a sample is playing. */
export const VoicePlayerBar: React.FC<VoicePlayerBarProps> = ({
  voice,
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  onSeek,
  onClose,
}) => {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    onSeek((e.clientX - rect.left) / rect.width);
  };

  return (
    <div className="flex-shrink-0 border-t border-border bg-surface/95 backdrop-blur px-5 py-3 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-bottom-2 duration-200">
      <div className="flex items-center gap-3 min-w-[200px] max-w-xs">
        <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent flex-shrink-0">
          <Mic className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate">{voice.name}</p>
          <p className="text-xs text-text-secondary truncate">
            {voice.description || 'Đang nghe thử giọng mẫu'}
          </p>
        </div>
      </div>

      <div className="flex-1 max-w-xl flex items-center gap-3">
        <button
          type="button"
          onClick={onTogglePlay}
          className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors shadow-sm flex-shrink-0 cursor-pointer"
          title={isPlaying ? 'Tạm dừng' : 'Tiếp tục phát'}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        <span className="text-xs font-mono text-text-muted tabular-nums w-10 text-right">
          {formatClock(currentTime)}
        </span>

        <div
          onClick={handleSeek}
          className="flex-1 h-2 bg-bg border border-border rounded-full cursor-pointer relative group flex items-center"
        >
          <div className="h-full bg-accent rounded-full relative transition-all" style={{ width: `${progress}%` }}>
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-accent border-2 border-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </div>

        <span className="text-xs font-mono text-text-muted tabular-nums w-10">{formatClock(duration)}</span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="p-2 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors cursor-pointer"
        title="Đóng trình phát"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
