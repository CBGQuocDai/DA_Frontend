'use client';

import { useCallback, useEffect, useState } from 'react';

interface AsyncResult<T> {
  load: () => Promise<T>;
  reloadCount: number;
  data?: T;
  error?: unknown;
  /** Dữ liệu thành công gần nhất và thời điểm nhận, giữ qua các lần tải sau và cả khi lỗi */
  lastData?: T;
  loadedAt?: Date;
}

interface AsyncDataOptions {
  /**
   * Tiếp tục trả dữ liệu cũ trong lúc `load` mới (hoặc reload) đang chạy, đánh dấu bằng
   * `isRefreshing`, thay vì quay về `undefined` rồi hiện lại skeleton.
   */
  keepPrevious?: boolean;
}

/**
 * Chạy `load` mỗi khi hàm này đổi (hãy bọc bằng useCallback) và trả về kết quả.
 * State chỉ được set trong callback của promise nên response cũ không bao giờ ghi đè response mới.
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
    /** Đang tải lại trong khi dữ liệu cũ vẫn hiển thị (chỉ khi bật keepPrevious) */
    isRefreshing: !isCurrent && previous !== undefined,
    loadedAt: result?.loadedAt,
    reload,
  };
};
