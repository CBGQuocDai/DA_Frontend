"use client";

import React, { useEffect, useRef, useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  Check,
  Headphones,
  Heart,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  SkipBack,
  SkipForward,
  Timer,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import type { useAudioPlayer } from "@/src/presentation/hooks/common";
import type { Book, Chapter } from "@/src/shared/types";
import { formatClock, resolveMediaUrl } from "@/src/shared/utils";
import { BookCover } from "../book";
import {
  ExpandedAudioPlayer,
  type PlayerChapterList,
} from "./ExpandedAudioPlayer";
import styles from "./AudioPlayerBar.module.css";

const SKIP_SECONDS = 10;
const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2];
const SLEEP_OPTIONS = [15, 30, 45, 60];
const iconButtonClass = `${styles.iconButton} flex shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-accent-light hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent`;
const panelClass =
  "absolute bottom-full right-0 z-10 mb-4 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/10 focus:outline-none";
const optionClass =
  "flex w-full items-center justify-between gap-6 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-accent-light hover:text-accent focus-visible:outline-2 focus-visible:outline-accent";

interface AudioPlayerBarProps {
  chapter: Chapter;
  bookTitle: string;
  coverImage?: string;
  subtitle: string;
  player: ReturnType<typeof useAudioPlayer>;
  chapterList: PlayerChapterList;
  nextBook?: Book;
  isFavorite: boolean;
  isFavoriteBusy: boolean;
  onToggleFavorite: () => void;
  onPreviousChapter?: () => void;
  onNextChapter?: () => void;
  isChangingChapter?: boolean;
  chapterNavigationError?: string | null;
  showBuyButton: boolean;
  onBuy: () => void;
  onClose: () => void;
}

/** Compact player with book information, centered playback controls and listening tools. */
export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  chapter,
  bookTitle,
  coverImage,
  subtitle,
  player,
  chapterList,
  nextBook,
  isFavorite,
  isFavoriteBusy,
  onToggleFavorite,
  onPreviousChapter,
  onNextChapter,
  isChangingChapter = false,
  chapterNavigationError = null,
  showBuyButton,
  onBuy,
  onClose,
}) => {
  const {
    audioProps,
    isPlaying,
    currentTime,
    duration,
    togglePlay,
    pause,
    skip,
    seek,
    volume,
    isMuted,
    playbackRate,
    setVolume,
    toggleMute,
    setPlaybackRate,
  } = player;
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dockHeight, setDockHeight] = useState(104);
  const dockRef = useRef<HTMLElement>(null);
  const src = resolveMediaUrl(chapter.audioUrl);
  const hasDuration = Number.isFinite(duration) && duration > 0;
  const elapsed = hasDuration
    ? Math.min(Math.max(currentTime, 0), duration)
    : 0;
  const progress = hasDuration ? (elapsed / duration) * 100 : 0;

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const observer = new ResizeObserver(() => {
      setDockHeight(Math.ceil(dock.getBoundingClientRect().height));
    });
    observer.observe(dock);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (sleepMinutes == null) return;
    const timer = window.setTimeout(() => {
      pause();
      setSleepMinutes(null);
    }, sleepMinutes * 60_000);
    return () => window.clearTimeout(timer);
  }, [sleepMinutes, pause]);

  useEffect(() => {
    if (!isExpanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsExpanded(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isExpanded]);

  return (
    <>
      {isExpanded && (
        <ExpandedAudioPlayer
          chapter={chapter}
          bookTitle={bookTitle}
          coverImage={coverImage}
          player={player}
          chapterList={chapterList}
          nextBook={nextBook}
          dockHeight={dockHeight}
          onBuy={onBuy}
          onNavigateBook={onClose}
          onPreviousChapter={onPreviousChapter}
          onNextChapter={onNextChapter}
          isChangingChapter={isChangingChapter}
        />
      )}
      <aside
        ref={dockRef}
        aria-label="Trình phát âm thanh"
        className={`${styles.player} fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/95 text-slate-900 shadow-[0_-8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl`}
      >
        {src && <audio key={src} src={src} {...audioProps} />}

        <div className={styles.layout}>
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`${styles.cover} flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-accent/15 bg-accent-light text-accent shadow-sm`}
            >
              {coverImage ? (
                <BookCover title={bookTitle} coverImage={coverImage} />
              ) : (
                <Headphones className="h-6 w-6" />
              )}
            </div>
            <div className="min-w-0 flex-1" title={subtitle}>
              <p className="truncate text-xs font-bold sm:text-sm">{bookTitle}</p>
              <p className="mt-1 truncate text-[11px] text-slate-500">
                {chapter.title}
              </p>
            </div>
          </div>

          <div className={`${styles.playback} min-w-0`}>
            <div className={styles.controlRow}>
              <button
                type="button"
                onClick={onToggleFavorite}
                disabled={isFavoriteBusy}
                aria-pressed={isFavorite}
                aria-busy={isFavoriteBusy}
                aria-label={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                title={isFavorite ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                data-active={isFavorite}
                className={`${iconButtonClass} data-[active=true]:text-accent`}
              >
                <Heart
                  className="h-6 w-6"
                  fill={isFavorite ? "currentColor" : "none"}
                />
              </button>

              <div className="flex min-w-0 items-center justify-center sm:gap-2">
                <button
                  type="button"
                  onClick={() => skip(-SKIP_SECONDS)}
                  disabled={!src || !hasDuration}
                  className={iconButtonClass}
                  aria-label="Lùi 10 giây"
                  title="Lùi 10 giây"
                >
                  <span className="relative flex h-7 w-7 items-center justify-center">
                    <RotateCcw className="h-7 w-7" />
                    <span className="absolute top-2.5 text-[9px] font-bold leading-none">
                      10
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={onPreviousChapter}
                  disabled={!onPreviousChapter || isChangingChapter}
                  aria-busy={isChangingChapter}
                  className={iconButtonClass}
                  aria-label="Chương trước"
                  title="Chương trước"
                >
                  <SkipBack className="h-6 w-6" fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={!src}
                  className={`${styles.playButton} flex shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-md shadow-accent/20 ring-4 ring-accent/10 transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent`}
                  aria-label={isPlaying ? "Tạm dừng" : "Tiếp tục phát"}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6" fill="currentColor" />
                  ) : (
                    <Play className="ml-0.5 h-6 w-6" fill="currentColor" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={onNextChapter}
                  disabled={!onNextChapter || isChangingChapter}
                  aria-busy={isChangingChapter}
                  className={iconButtonClass}
                  aria-label="Chương tiếp theo"
                  title="Chương tiếp theo"
                >
                  <SkipForward className="h-6 w-6" fill="currentColor" />
                </button>
                <button
                  type="button"
                  onClick={() => skip(SKIP_SECONDS)}
                  disabled={!src || !hasDuration}
                  className={iconButtonClass}
                  aria-label="Tiến 10 giây"
                  title="Tiến 10 giây"
                >
                  <span className="relative flex h-7 w-7 items-center justify-center">
                    <RotateCw className="h-7 w-7" />
                    <span className="absolute top-2.5 text-[9px] font-bold leading-none">
                      10
                    </span>
                  </span>
                </button>
              </div>

              <Popover className="relative">
                <PopoverButton
                  disabled={!src}
                  className={`${iconButtonClass} text-sm font-bold`}
                  aria-label={`Tốc độ phát ${playbackRate}x`}
                  title="Tốc độ phát"
                >
                  {playbackRate}x
                </PopoverButton>
                <PopoverPanel className={`${panelClass} w-40`}>
                  {({ close }) => (
                    <>
                      <p className="px-3 pb-2 pt-1 text-[11px] font-bold text-slate-900">
                        Tốc độ phát
                      </p>
                      {PLAYBACK_RATES.map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          className={optionClass}
                          aria-pressed={playbackRate === rate}
                          onClick={() => {
                            setPlaybackRate(rate);
                            close();
                          }}
                        >
                          <span>
                            {rate}x{rate === 1 ? " · Chuẩn" : ""}
                          </span>
                          {playbackRate === rate && (
                            <Check className="h-3.5 w-3.5 text-accent" />
                          )}
                        </button>
                      ))}
                    </>
                  )}
                </PopoverPanel>
              </Popover>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] font-medium tabular-nums text-slate-500">
              <span className="w-10 shrink-0 text-right">
                {formatClock(elapsed)}
              </span>
              <input
                type="range"
                min={0}
                max={hasDuration ? duration : 0}
                step={0.1}
                value={elapsed}
                disabled={!src || !hasDuration}
                onChange={(event) => seek(Number(event.target.value) / duration)}
                aria-label="Vị trí phát"
                aria-valuetext={`${formatClock(elapsed)} trên ${formatClock(duration)}`}
                className={styles.seekBar}
                style={{
                  background: `linear-gradient(to right, var(--color-accent) ${progress}%, var(--color-border) ${progress}%)`,
                }}
              />
              <span className="w-10 shrink-0">
                -{formatClock(hasDuration ? duration - elapsed : 0)}
              </span>
            </div>
            {isChangingChapter && <p role="status" className="mt-1 text-center text-[11px] text-slate-500">Đang tải chương...</p>}
            {chapterNavigationError && <p role="alert" className="mt-1 text-center text-[11px] text-red-600">{chapterNavigationError}</p>}
            {!src && (
              <p
                role="status"
                className="mt-1 text-center text-[11px] text-slate-500"
              >
                Chương này chưa có audio.
              </p>
            )}
          </div>

          <div
            className={`${styles.tools} flex items-center justify-end gap-0.5 sm:gap-1`}
          >
            {showBuyButton && (
              <button
                type="button"
                onClick={onBuy}
                className={`${styles.buyButton} mr-1 whitespace-nowrap rounded-full bg-accent-light px-3.5 py-2.5 text-xs font-bold text-accent transition-colors hover:bg-accent hover:text-white`}
              >
                Mua trọn bộ
              </button>
            )}
            <Popover className="relative">
              <PopoverButton
                disabled={!src}
                className={`${iconButtonClass} ${sleepMinutes ? "bg-accent-light text-accent" : ""}`}
                aria-label={
                  sleepMinutes
                    ? `Hẹn giờ dừng sau ${sleepMinutes} phút`
                    : "Hẹn giờ tắt"
                }
                title="Hẹn giờ tắt"
              >
                {sleepMinutes ? (
                  <span className="text-xs font-bold">{sleepMinutes}p</span>
                ) : (
                  <Timer className="h-[22px] w-[22px]" />
                )}
              </PopoverButton>
              <PopoverPanel className={`${panelClass} w-44`}>
                {({ close }) => (
                  <>
                    <p className="px-3 pb-2 pt-1 text-[11px] font-bold text-slate-900">
                      Hẹn giờ tắt
                    </p>
                    {[null, ...SLEEP_OPTIONS].map((minutes) => (
                      <button
                        key={minutes ?? "off"}
                        type="button"
                        className={optionClass}
                        aria-pressed={sleepMinutes === minutes}
                        onClick={() => {
                          setSleepMinutes(minutes);
                          close();
                        }}
                      >
                        <span>
                          {minutes == null
                            ? "Tắt hẹn giờ"
                            : `Sau ${minutes} phút`}
                        </span>
                        {sleepMinutes === minutes && (
                          <Check className="h-3.5 w-3.5 text-accent" />
                        )}
                      </button>
                    ))}
                  </>
                )}
              </PopoverPanel>
            </Popover>
            <button
              type="button"
              onClick={() => setIsExpanded((expanded) => !expanded)}
              className={`${iconButtonClass} ${styles.expandButton}`}
              aria-label={
                isExpanded ? "Thu gọn trình phát" : "Mở rộng trình phát"
              }
              aria-expanded={isExpanded}
              title={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              {isExpanded ? (
                <Minimize className="h-[22px] w-[22px]" />
              ) : (
                <Maximize className="h-[22px] w-[22px]" />
              )}
            </button>
            <Popover className="relative">
              <PopoverButton
                disabled={!src}
                className={iconButtonClass}
                aria-label="Điều chỉnh âm lượng"
                title="Âm lượng"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-[22px] w-[22px]" />
                ) : (
                  <Volume2 className="h-[22px] w-[22px]" />
                )}
              </PopoverButton>
              <PopoverPanel className={`${panelClass} w-52 p-4`}>
                <p className="mb-3 text-[11px] font-bold text-slate-900">
                  Âm lượng
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className={iconButtonClass}
                    aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={isMuted ? 0 : volume}
                    onChange={(event) => setVolume(Number(event.target.value))}
                    aria-label="Âm lượng"
                    className="min-w-0 flex-1 accent-accent"
                  />
                  <span className="w-7 text-right text-[10px] tabular-nums text-slate-500">
                    {Math.round((isMuted ? 0 : volume) * 100)}%
                  </span>
                </div>
              </PopoverPanel>
            </Popover>
            <button
              type="button"
              onClick={onClose}
              className={iconButtonClass}
              aria-label="Đóng thanh nghe"
              title="Đóng trình phát"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
