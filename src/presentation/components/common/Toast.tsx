'use client';

import React, { useEffect, useState, useSyncExternalStore } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react';

type ToastTone = 'success' | 'error' | 'warning' | 'info';

interface ToastItem {
  id: number;
  tone: ToastTone;
  title?: string;
  message: string;
  duration: number;
}

interface ToastOptions {
  title?: string;
  /** Thời gian hiển thị (ms); mặc định dài hơn cho lỗi để kịp đọc */
  duration?: number;
}

const TONES: Record<ToastTone, { Icon: typeof CircleAlert; className: string; duration: number }> = {
  success: { Icon: CircleCheck, className: 'bg-success-light text-success', duration: 4000 },
  info: { Icon: Info, className: 'bg-accent-light text-accent', duration: 4000 },
  warning: { Icon: TriangleAlert, className: 'bg-warning-light text-warning', duration: 6000 },
  error: { Icon: CircleAlert, className: 'bg-error-light text-error', duration: 6000 },
};

const MAX_TOASTS = 4;
const EXIT_MS = 150;

// Nằm ngoài React để hook, event handler và callback SSE đều gọi được như một hàm thường
let toasts: ToastItem[] = [];
let nextId = 0;
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];

const setToasts = (next: ToastItem[]) => {
  toasts = next;
  listeners.forEach((listener) => listener());
};

const push = (tone: ToastTone, message: string, { title, duration }: ToastOptions = {}) => {
  const item: ToastItem = { id: nextId++, tone, title, message, duration: duration ?? TONES[tone].duration };
  // Giữ tối đa vài thông báo, bỏ bớt cái cũ nhất
  setToasts([...toasts, item].slice(-MAX_TOASTS));
};

const dismiss = (id: number) => setToasts(toasts.filter((t) => t.id !== id));

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getToasts = () => toasts;
const getServerToasts = () => EMPTY;

/** Thông báo ngắn tự ẩn, không chặn thao tác. Lỗi cần người dùng xác nhận thì vẫn dùng `showAlert`. */
export const toast = {
  success: (message: string, options?: ToastOptions) => push('success', message, options),
  error: (message: string, options?: ToastOptions) => push('error', message, options),
  warning: (message: string, options?: ToastOptions) => push('warning', message, options),
  info: (message: string, options?: ToastOptions) => push('info', message, options),
};

const ToastCard: React.FC<{ item: ToastItem }> = ({ item }) => {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [remaining, setRemaining] = useState(item.duration);
  const { Icon, className } = TONES[item.tone];

  // Đếm ngược phần thời gian còn lại; rê chuột hoặc focus vào thì tạm dừng
  useEffect(() => {
    if (paused || leaving) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => setLeaving(true), remaining);
    return () => {
      clearTimeout(timer);
      setRemaining((left) => Math.max(0, left - (Date.now() - startedAt)));
    };
  }, [paused, leaving, remaining]);

  // Chờ hiệu ứng ẩn chạy xong mới gỡ khỏi danh sách
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => dismiss(item.id), EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, item.id]);

  return (
    <li
      role={item.tone === 'error' ? 'alert' : 'status'}
      data-leaving={leaving || undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto flex items-start gap-3 w-full bg-surface border border-border rounded-xl shadow-lg p-3.5 transition duration-150 ease-out starting:opacity-0 starting:translate-y-2 data-[leaving]:opacity-0 data-[leaving]:translate-x-4 motion-reduce:transition-none"
    >
      <span className={`flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 ${className}`}>
        <Icon className="w-4.5 h-4.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 pt-1">
        {item.title && <p className="text-sm font-semibold text-text-primary">{item.title}</p>}
        <p className={`text-sm leading-relaxed break-words ${item.title ? 'mt-0.5 text-text-secondary' : 'text-text-primary'}`}>
          {item.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => setLeaving(true)}
        aria-label="Đóng thông báo"
        className="-mr-1 -mt-0.5 p-1.5 rounded-lg text-text-muted hover:bg-bg hover:text-text-primary cursor-pointer flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </li>
  );
};

/** Hiển thị các thông báo được gửi qua `toast`. Chỉ mount một lần ở root layout. */
export const ToastHost: React.FC = () => {
  const items = useSyncExternalStore(subscribe, getToasts, getServerToasts);

  // Vùng live luôn có mặt để trình đọc màn hình đọc được thông báo mới chèn vào
  return (
    <section aria-label="Thông báo" aria-live="polite" className="pointer-events-none fixed z-[70] bottom-4 inset-x-4 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96">
      <ol className="flex flex-col gap-2">
        {items.map((item) => (
          <ToastCard key={item.id} item={item} />
        ))}
      </ol>
    </section>
  );
};
