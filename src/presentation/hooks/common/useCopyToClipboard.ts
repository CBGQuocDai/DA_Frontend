'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const RESET_AFTER_MS = 2000;

/** Copies text and remembers which field was copied for a short moment. */
export const useCopyToClipboard = () => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async (text: string, key: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopiedKey(null), RESET_AFTER_MS);
  }, []);

  return { copiedKey, copy };
};
