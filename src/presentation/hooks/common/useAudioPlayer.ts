'use client';

import { useCallback, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** State and controls for a single <audio> element; spread `audioProps` onto it. */
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => setIsPlaying(false));
    else audio.pause();
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = clamp(audio.currentTime + seconds, 0, audio.duration);
  }, []);

  /** Jump to a position given as a 0..1 fraction of the track. */
  const seek = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = clamp(fraction, 0, 1) * audio.duration;
  }, []);

  const audioProps = {
    ref: audioRef,
    autoPlay: true,
    onPlay: () => setIsPlaying(true),
    onPause: () => setIsPlaying(false),
    onEnded: () => setIsPlaying(false),
    onTimeUpdate: (e: SyntheticEvent<HTMLAudioElement>) => setCurrentTime(e.currentTarget.currentTime),
    onLoadedMetadata: (e: SyntheticEvent<HTMLAudioElement>) => {
      setDuration(e.currentTarget.duration);
      setCurrentTime(0);
      // A new element mounts per track; autoplay may have been blocked
      setIsPlaying(!e.currentTarget.paused);
    },
  };

  return { audioProps, isPlaying, currentTime, duration, togglePlay, skip, seek };
};
