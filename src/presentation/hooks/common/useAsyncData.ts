'use client';

import { useCallback, useEffect, useState } from 'react';

interface AsyncResult<T> {
  load: () => Promise<T>;
  reloadCount: number;
  data?: T;
  error?: unknown;
  /** Latest successful data and when it arrived, carried across later loads and errors */
  lastData?: T;
  loadedAt?: Date;
}

interface AsyncDataOptions {
  /**
   * Keep returning the previous data while a new `load` (or a reload) is in flight, flagged by
   * `isRefreshing`, instead of dropping back to `undefined` and showing a skeleton again.
   */
  keepPrevious?: boolean;
}

/**
 * Runs `load` whenever its identity changes (wrap it in useCallback) and exposes the result.
 * State is only set from the promise callbacks, so a stale response never overwrites a newer one.
 */
export const useAsyncData = <T>(load: () => Promise<T>, { keepPrevious = false }: AsyncDataOptions = {}) => {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<AsyncResult<T> | null>(null);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setResult({ load, reloadCount, data, lastData: data, loadedAt: new Date() });
      },
      (error) => {
        if (active) setResult((prev) => ({ load, reloadCount, error, lastData: prev?.lastData, loadedAt: prev?.loadedAt }));
      }
    );
    return () => {
      active = false;
    };
  }, [load, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const isCurrent = result?.load === load && result.reloadCount === reloadCount;
  const previous = keepPrevious ? result?.lastData : undefined;

  return {
    data: isCurrent ? (result.data ?? previous) : previous,
    error: isCurrent ? result.error : undefined,
    isLoading: !isCurrent,
    /** Loading again while the previous data is still shown (keepPrevious only) */
    isRefreshing: !isCurrent && previous !== undefined,
    loadedAt: result?.loadedAt,
    reload,
  };
};
