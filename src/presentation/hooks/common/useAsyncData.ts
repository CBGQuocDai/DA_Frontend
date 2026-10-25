'use client';

import { useCallback, useEffect, useState } from 'react';

interface AsyncResult<T> {
  load: () => Promise<T>;
  reloadCount: number;
  data?: T;
  error?: unknown;
}

/**
 * Runs `load` whenever its identity changes (wrap it in useCallback) and exposes the result.
 * State is only set from the promise callbacks, so a stale response never overwrites a newer one.
 */
export const useAsyncData = <T>(load: () => Promise<T>) => {
  const [reloadCount, setReloadCount] = useState(0);
  const [result, setResult] = useState<AsyncResult<T> | null>(null);

  useEffect(() => {
    let active = true;
    load().then(
      (data) => {
        if (active) setResult({ load, reloadCount, data });
      },
      (error) => {
        if (active) setResult({ load, reloadCount, error });
      }
    );
    return () => {
      active = false;
    };
  }, [load, reloadCount]);

  const reload = useCallback(() => setReloadCount((count) => count + 1), []);
  const isCurrent = result?.load === load && result.reloadCount === reloadCount;

  return {
    data: isCurrent ? result.data : undefined,
    error: isCurrent ? result.error : undefined,
    isLoading: !isCurrent,
    reload,
  };
};
