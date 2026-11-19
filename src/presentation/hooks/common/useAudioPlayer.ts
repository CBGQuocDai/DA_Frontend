'use client';

import { useCallback, useRef, useState } from 'react';
import type { SyntheticEvent } from 'react';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Trạng thái và điều khiển cho một thẻ <audio>; spread `audioProps` vào thẻ đó. */
export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);

  const pause = useCallback(() => audioRef.current?.pause(), []);

  const setVolume = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    const next = clamp(value, 0, 1);
    setVolumeState(next);
    setIsMuted(next === 0);
    if (audioRef.current) {
      audioRef.current.volume = next;
      audioRef.current.muted = next === 0;
    }
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    if (!next && volume === 0) setVolumeState(1);
    if (audioRef.current) {
      audioRef.current.muted = next;
      if (!next && volume === 0) audioRef.current.volume = 1;
    }
  }, [isMuted, volume]);

  const setPlaybackRate = useCallback((value: number) => {
    if (!Number.isFinite(value)) return;
    const next = clamp(value, 0.5, 2);
    setPlaybackRateState(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }, []);

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

  /** Tua tới vị trí tính theo tỉ lệ 0..1 của bản audio. */
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
      e.currentTarget.volume = volume;
      e.currentTarget.muted = isMuted;
      e.currentTarget.playbackRate = playbackRate;
      setDuration(e.currentTarget.duration);
      setCurrentTime(0);
      // Mỗi bản audio mount một thẻ mới; autoplay có thể đã bị trình duyệt chặn
      setIsPlaying(!e.currentTarget.paused);
    },
  };

  return {
    audioProps, isPlaying, currentTime, duration, togglePlay, pause, skip, seek,
    volume, isMuted, playbackRate, setVolume, toggleMute, setPlaybackRate,
  };
};
