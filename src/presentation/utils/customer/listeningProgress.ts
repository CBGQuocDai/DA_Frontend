import type { BookProgress, ChapterProgress, SaveListeningProgress } from '@/src/shared/types';

interface ProgressTransport {
  load: () => Promise<BookProgress>;
  save: (chapterId: number, body: SaveListeningProgress) => Promise<BookProgress>;
}

export interface ListeningProgressState {
  progress: BookProgress | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

const statusOf = (error: unknown) => (error as { status?: number })?.status;
const retryable = (error: unknown) => !statusOf(error) || statusOf(error)! >= 500 || statusOf(error) === 429;
const messageFor = (error: unknown, reading: boolean) => {
  if (statusOf(error) === 401) return 'Phiên đăng nhập đã hết hạn. Đăng nhập lại để lưu tiến trình.';
  if (statusOf(error) === 403) return 'Bạn chưa có quyền lưu tiến trình của chương này.';
  if (statusOf(error) === 409) return 'Audio của chương đang được xử lý. Vui lòng thử lại sau.';
  if (statusOf(error) === 400 || statusOf(error) === 404) return 'Không thể cập nhật tiến trình của chương này. Vui lòng tải lại trang.';
  return reading
    ? 'Không thể tải tiến trình nghe. Vui lòng thử lại để khôi phục vị trí.'
    : 'Chưa lưu được tiến trình nghe. Vui lòng kiểm tra kết nối hoặc thử lại.';
};

/** A single ordered queue per customer/book. Pending rewinds always supersede older requests. */
export const createListeningProgress = (transport: ProgressTransport) => {
  let state: ListeningProgressState = { progress: null, isLoading: true, isSaving: false, error: null };
  let loading: Promise<BookProgress> | null = null;
  let saving: Promise<void> | null = null;
  let revision = 0;
  let automaticRetry = true;
  let serverProgress: BookProgress | null = null;
  const dirty = new Map<number, ChapterProgress>();
  const pending = new Map<number, ChapterProgress>();
  const listeners = new Set<() => void>();
  const publish = (next: Partial<ListeningProgressState>) => {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener());
  };
  const merge = (server: BookProgress): BookProgress => {
    const chapters = new Map(server.chapters.map((chapter) => [chapter.chapterId, chapter]));
    dirty.forEach((chapter, id) => chapters.set(id, chapter));
    const positions = [...chapters.values()].sort((a, b) => a.chapterIndex - b.chapterIndex);
    return { ...server, chapters: positions, hasProgress: positions.length > 0 };
  };
  const load = (refresh = false): Promise<BookProgress> => {
    if (!refresh && state.progress) return Promise.resolve(state.progress);
    if (loading) return loading;
    const startedAt = revision;
    publish({ isLoading: true, ...(state.progress ? {} : { error: null }) });
    loading = transport.load().then((progress) => {
      // An earlier GET must not roll back a PUT that was accepted while the read was in flight.
      if (revision === startedAt || !state.progress) {
        serverProgress = progress;
        publish({ progress: merge(progress) });
      }
      publish({ isLoading: false, ...(pending.size === 0 ? { error: null } : {}) });
      return state.progress!;
    }).catch((error: unknown) => {
      publish({ isLoading: false, error: messageFor(error, true) });
      throw error;
    }).finally(() => { loading = null; });
    return loading;
  };
  const reload = async () => {
    if (loading) await loading.catch(() => {});
    return load(true);
  };
  const flush = (manual = false): Promise<void> => {
    if (saving) return saving;
    if (pending.size === 0 || (!automaticRetry && !manual)) return Promise.resolve();
    publish({ isSaving: true });
    saving = (async () => {
      while (pending.size > 0) {
        const chapter = pending.values().next().value!;
        pending.delete(chapter.chapterId);
        try {
          const result = await transport.save(chapter.chapterId, {
            lastPlayAt: chapter.lastPlayAt, isComplete: chapter.isComplete,
          });
          revision++;
          automaticRetry = true;
          serverProgress = result;
          if (dirty.get(chapter.chapterId) === chapter) dirty.delete(chapter.chapterId);
          publish({ progress: merge(result), error: null });
        } catch (error) {
          if (!retryable(error) && statusOf(error) !== 401) {
            // Invalid/deleted/locked chapters should not block later saves of other chapters.
            if (dirty.get(chapter.chapterId) === chapter) dirty.delete(chapter.chapterId);
            publish({ progress: serverProgress ? merge(serverProgress) : null, error: messageFor(error, false) });
            break;
          }
          if (!pending.has(chapter.chapterId)) {
            const newer = [...pending.entries()];
            pending.clear();
            pending.set(chapter.chapterId, chapter);
            newer.forEach(([id, value]) => pending.set(id, value));
          }
          automaticRetry = retryable(error);
          publish({ error: messageFor(error, false) });
          break;
        }
      }
    })().finally(() => {
      saving = null;
      publish({ isSaving: false });
    });
    return saving;
  };
  return {
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getSnapshot: () => state,
    load,
    reload,
    flush,
    prepareResume: async () => {
      await load();
      await flush(true);
      if (pending.size > 0) throw new Error('Progress is still pending');
      // Refresh also picks up progress from another device or newly purchased chapters.
      return reload();
    },
    restore: async (chapterId: number, duration: number) => {
      const saved = (await load()).chapters.find((chapter) => chapter.chapterId === chapterId);
      return saved?.isComplete && saved.lastPlayAt >= duration - 1 ? 0 : saved?.lastPlayAt ?? 0;
    },
    checkpoint: (chapterId: number, chapterIndex: number, position: number, complete: boolean) => {
      if (!state.progress || !Number.isFinite(position) || position < 0) return;
      const previous = state.progress.chapters.find((chapter) => chapter.chapterId === chapterId);
      const lastPlayAt = Math.floor(position);
      const isComplete = complete || Boolean(previous?.isComplete);
      if (previous?.lastPlayAt === lastPlayAt && previous.isComplete === isComplete) return;
      const chapter: ChapterProgress = {
        chapterId, chapterIndex, lastPlayAt, isComplete, updatedAt: new Date().toISOString(),
      };
      dirty.set(chapterId, chapter);
      // Keep the latest listening event last, even when coalescing an older pending chapter.
      pending.delete(chapterId);
      pending.set(chapterId, chapter);
      publish({ progress: merge(serverProgress ?? state.progress) });
      void flush();
    },
  };
};
