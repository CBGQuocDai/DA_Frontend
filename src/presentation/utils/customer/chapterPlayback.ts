import type { Chapter, PaginatedResponse } from '@/src/shared/types';

type ChapterPage = PaginatedResponse<Chapter>;
const PAGE_CACHE_TTL_MS = 5 * 60_000;

interface CurrentChapter {
  chapter: Chapter;
  /** Zero-based position in the whole book, independent of the visible chapter page. */
  index: number;
}

interface PlaybackState {
  current: CurrentChapter | null;
  isNavigating: boolean;
  error: string | null;
}

interface NavigationOptions {
  total: number;
  isUnlocked: (index: number) => boolean;
  onLocked: () => void;
  beforeChange: () => void;
}

/** One playback cursor and a short-lived chapter-page cache for a single book. */
export const createChapterPlayback = (
  fetchPage: (page: number) => Promise<ChapterPage>,
  pageSize: number,
) => {
  let state: PlaybackState = { current: null, isNavigating: false, error: null };
  let requestVersion = 0;
  const listeners = new Set<() => void>();
  const pages = new Map<number, { promise: Promise<ChapterPage>; loadedAt: number | null }>();

  const update = (next: PlaybackState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const loadPage = (page: number): Promise<ChapterPage> => {
    const cached = pages.get(page);
    if (cached && (cached.loadedAt == null || Date.now() - cached.loadedAt < PAGE_CACHE_TTL_MS)) {
      return cached.promise;
    }

    const entry = { promise: fetchPage(page), loadedAt: null as number | null };
    pages.set(page, entry);
    entry.promise.then(
      () => { entry.loadedAt = Date.now(); },
      () => { if (pages.get(page) === entry) pages.delete(page); },
    );
    return entry.promise;
  };

  const cancelNavigation = () => {
    requestVersion += 1;
    if (state.isNavigating) update({ ...state, isNavigating: false });
  };

  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => state,
    loadPage,
    invalidatePage: (page: number) => { pages.delete(page); },
    cancelNavigation,
    select: (chapter: Chapter, index: number) => {
      requestVersion += 1;
      update({ current: { chapter, index }, isNavigating: false, error: null });
    },
    close: () => {
      requestVersion += 1;
      update({ current: null, isNavigating: false, error: null });
    },
    navigate: async (direction: 'previous' | 'next', options: NavigationOptions) => {
      const current = state.current;
      if (!current || state.isNavigating) return;
      const index = current.index + (direction === 'previous' ? -1 : 1);
      if (index < 0 || index >= options.total) return;
      if (!options.isUnlocked(index)) {
        options.onLocked();
        return;
      }

      const version = ++requestVersion;
      update({ ...state, isNavigating: true, error: null });
      try {
        const page = Math.floor(index / pageSize);
        const result = await loadPage(page);
        if (version !== requestVersion) return;
        const chapter = result.content[index % pageSize];
        if (!chapter) {
          pages.delete(page);
          throw new Error('Chapter is no longer available on this page');
        }
        options.beforeChange();
        update({ current: { chapter, index }, isNavigating: false, error: null });
      } catch {
        if (version !== requestVersion) return;
        update({ ...state, isNavigating: false, error: 'Không thể chuyển chương. Vui lòng bấm lại để thử lại.' });
      }
    },
  };
};
