import React from 'react';
import { Pause, Play } from 'lucide-react';

interface VoicePlayButtonProps {
  isActive: boolean;
  isPlaying: boolean;
  onClick: () => void;
}

const EQUALIZER_BARS = ['h-3 [animation-delay:-0.3s]', 'h-2 [animation-delay:-0.15s]', 'h-3.5', 'h-2 [animation-delay:-0.2s]'];

/** "Nghe thử" / "Đang phát" / "Tiếp tục" pill for a voice sample. */
export const VoicePlayButton: React.FC<VoicePlayButtonProps> = ({ isActive, isPlaying, onClick }) => {
  if (isActive && isPlaying) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-white text-xs font-semibold shadow-sm hover:bg-accent-hover transition-all cursor-pointer"
      >
        <span className="flex items-end gap-[2px] h-3">
          {EQUALIZER_BARS.map((bar) => (
            <span key={bar} className={`w-0.5 bg-white rounded-full animate-bounce ${bar}`} />
          ))}
        </span>
        <Pause className="w-3 h-3 fill-current ml-0.5" />
        <span>Đang phát</span>
      </button>
    );
  }

  if (isActive) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent text-xs font-semibold hover:bg-accent hover:text-white transition-all cursor-pointer"
      >
        <Play className="w-3 h-3 fill-current" />
        <span>Tiếp tục</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg border border-border text-text-secondary hover:border-accent hover:text-accent hover:bg-accent-light/50 text-xs font-medium transition-all cursor-pointer shadow-2xs"
    >
      <Play className="w-3 h-3 fill-current transition-transform group-hover:scale-110" />
      <span>Nghe thử</span>
    </button>
  );
};
