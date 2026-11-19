'use client';

import { useEffect, useRef } from 'react';
import { connectAdminEvents, type AdminEventHandlers } from '@/src/infrastructure/api/sse/adminEvents';

/** Giữ một kết nối SSE trong suốt vòng đời component và chuyển event tới handler mới nhất. */
export const useAdminEvents = (handlers: AdminEventHandlers) => {
  const latest = useRef(handlers);
  useEffect(() => {
    latest.current = handlers;
  });

  useEffect(
    () =>
      connectAdminEvents({
        onBookStatus: (event) => latest.current.onBookStatus?.(event),
        onChapterStatus: (event) => latest.current.onChapterStatus?.(event),
        onReconnect: () => latest.current.onReconnect?.(),
      }),
    []
  );
};
