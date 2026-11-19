import type { Chapter } from '@/src/shared/types';

const CACHE_TTL_MS = 5 * 60_000;
class PlaybackError extends Error {}

export const isPlayableChapter = (chapter: Chapter) => chapter.status === 'AUDIO_READY'
  && Boolean(chapter.audioUrl) && Number.isFinite(chapter.duration) && (chapter.duration ?? 0) > 0;

interface PlaybackState {
  current: { chapter: Chapter; index: number } | null;
  isNavigating: boolean;
  error: string | null;
}

interface NavigationOptions {
  isUnlocked: (index: number) => boolean;
  onLocked: () => void;
  beforeChange: () => void;
}

/** A book's complete chapter list and playback cursor. No chapter pagination is needed. */
export const createChapterPlayback = (fetchChapters: () => Promise<Chapter[]>) => {
  let state: PlaybackState = { current: null, isNavigating: false, error: null };
  let requestVersion = 0;
  let cache: { promise: Promise<Chapter[]>; loadedAt: number | null } | null = null;
  const listeners = new Set<() => void>();
  const update = (next: PlaybackState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };
  const load = (): Promise<Chapter[]> => {
    if (cache && (cache.loadedAt == null || Date.now() - cache.loadedAt < CACHE_TTL_MS)) return cache.promise;
    const entry = { promise: fetchChapters(), loadedAt: null as number | null };
    cache = entry;
    entry.promise.then(
      () => { entry.loadedAt = Date.now(); },
      () => { if (cache === entry) cache = null; },
    );
    return entry.promise;
  };
  const change = async (resolveIndex: (chapters: Chapter[]) => number | null | Promise<number | null>, options: NavigationOptions) => {
    if (state.isNavigating) return;
    const version = ++requestVersion;
    update({ ...state, isNavigating: true, error: null });
    try {
      const chapters = await load();
      if (version !== requestVersion) return;
      const index = await resolveIndex(chapters);
      if (version !== requestVersion) return;
      if (index == null) { update({ ...state, isNavigating: false }); return; }
      const chapter = chapters[index];
      if (!chapter) throw new PlaybackError('Không tìm thấy chương cần nghe. Vui lòng tải lại danh sách chương.');
      if (!options.isUnlocked(index)) {
        update({ ...state, isNavigating: false });
        options.onLocked();
        return;
      }
      if (!isPlayableChapter(chapter)) throw new PlaybackError('Chương này chưa sẵn sàng để nghe. Vui lòng chọn chương khác.');
      options.beforeChange();
      update({ current: { chapter, index }, isNavigating: false, error: null });
    } catch (error) {
      if (version !== requestVersion) return;
      update({ ...state, isNavigating: false, error: error instanceof PlaybackError ? error.message : 'Không thể mở chương. Vui lòng kiểm tra kết nối và thử lại.' });
    }
  };
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => state,
    load,
    invalidate: () => { cache = null; },
    cancelNavigation: () => {
      requestVersion++;
      if (state.isNavigating) update({ ...state, isNavigating: false });
    },
    close: () => {
      requestVersion++;
      update({ current: null, isNavigating: false, error: null });
    },
    open: (target: number | (() => Promise<number | null>), options: NavigationOptions) => change(async (chapters) => {
      const id = typeof target === 'function' ? await target() : target;
      return id == null ? (chapters.length ? 0 : null) : chapters.findIndex((chapter) => chapter.id === id);
    }, options),
    navigate: (direction: 'previous' | 'next', options: NavigationOptions) => {
      const id = state.current?.chapter.id;
      if (id == null) return Promise.resolve();
      return change((chapters) => {
        const current = chapters.findIndex((chapter) => chapter.id === id);
        if (current < 0) return -1;
        const index = current + (direction === 'previous' ? -1 : 1);
        return index < 0 || index >= chapters.length ? null : index;
      }, options);
    },
  };
};
