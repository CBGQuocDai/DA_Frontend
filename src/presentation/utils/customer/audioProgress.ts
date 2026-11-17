interface AudioProgressOptions {
  restorePosition: () => Promise<number>;
  onRestored: (position: number) => void;
  onRestoring?: (restoring: boolean) => void;
  onCheckpoint?: (position: number, complete: boolean) => void;
}

/** Own one media element's progress lifecycle. Callbacks remain bound to its outgoing chapter. */
export const createAudioProgress = (audio: HTMLAudioElement, options: AudioProgressOptions) => {
  let restored = false;
  let disposed = false;
  let restoring: Promise<void> | null = null;
  let restorationSeek = false;
  let wantsPlay = true;
  const checkpoint = (complete = false) => {
    if (!disposed && restored && Number.isFinite(audio.currentTime) && Number.isFinite(audio.duration) && audio.duration > 0) {
      options.onCheckpoint?.(audio.currentTime, complete);
    }
  };
  const restore = (): Promise<void> => {
    if (disposed || restored || audio.readyState < 1 || !Number.isFinite(audio.duration) || audio.duration <= 0) return Promise.resolve();
    if (restoring) return restoring;
    options.onRestoring?.(true);
    restoring = (async () => {
      try {
        const saved = await options.restorePosition();
        if (disposed) return;
        const position = saved >= audio.duration ? 0 : Math.max(0, saved);
        restorationSeek = audio.currentTime !== position;
        audio.currentTime = position;
        restored = true;
        options.onRestored(position);
      } catch {
        // Listening remains available. Do not save an initial zero over unread server progress.
      } finally {
        if (!disposed) options.onRestoring?.(false);
        if (!disposed && wantsPlay) void audio.play().catch(() => {});
      }
    })().finally(() => { restoring = null; });
    return restoring;
  };
  const onMetadata = () => { void restore(); };
  const onPause = () => checkpoint();
  const onSeeked = () => {
    if (restorationSeek) { restorationSeek = false; return; }
    checkpoint();
  };
  const onEnded = () => checkpoint(true);
  const onHidden = () => { if (document.visibilityState === 'hidden') checkpoint(); };
  const onPageHide = () => checkpoint();
  audio.addEventListener('loadedmetadata', onMetadata);
  audio.addEventListener('pause', onPause);
  audio.addEventListener('seeked', onSeeked);
  audio.addEventListener('ended', onEnded);
  if (typeof window !== 'undefined') window.addEventListener('pagehide', onPageHide);
  if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onHidden);
  const timer = setInterval(() => {
    if (!audio.paused && !audio.seeking && !audio.ended) checkpoint();
  }, 10_000);
  void restore();

  return {
    restore,
    isRestoring: () => restoring !== null,
    pause: () => {
      wantsPlay = false;
      checkpoint();
      audio.pause();
    },
    toggle: () => {
      if (restoring) { wantsPlay = !wantsPlay; return; }
      wantsPlay = audio.paused;
      if (wantsPlay) void audio.play().catch(() => {});
      else audio.pause();
    },
    dispose: () => {
      if (disposed) return;
      checkpoint();
      disposed = true;
      clearInterval(timer);
      audio.removeEventListener('loadedmetadata', onMetadata);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('seeked', onSeeked);
      audio.removeEventListener('ended', onEnded);
      if (typeof window !== 'undefined') window.removeEventListener('pagehide', onPageHide);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onHidden);
      audio.pause();
    },
  };
};
