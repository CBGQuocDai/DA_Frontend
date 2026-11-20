'use client';

import React, { useSyncExternalStore } from 'react';
import { Description, Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { CircleAlert, TriangleAlert } from 'lucide-react';
import { Button } from './Button';

type DialogTone = 'error' | 'warning';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
}

interface DialogRequest {
  id: number;
  tone: DialogTone;
  title?: string;
  message: string;
  confirmText: string;
  /** Chỉ hộp thoại xác nhận mới có nút hủy */
  cancelText?: string;
  resolve: (confirmed: boolean) => void;
}

const TONES: Record<DialogTone, { Icon: typeof CircleAlert; className: string }> = {
  error: { Icon: CircleAlert, className: 'bg-error-light text-error' },
  warning: { Icon: TriangleAlert, className: 'bg-warning-light text-warning' },
};

// Nằm ngoài React để hook và event handler có thể await hộp thoại như window.confirm
let queue: DialogRequest[] = [];
let nextId = 0;
const listeners = new Set<() => void>();

const setQueue = (next: DialogRequest[]) => {
  queue = next;
  listeners.forEach((listener) => listener());
};

const enqueue = (request: Omit<DialogRequest, 'id' | 'resolve'>) =>
  new Promise<boolean>((resolve) => {
    setQueue([...queue, { ...request, id: nextId++, resolve }]);
  });

/** Hộp thoại trả lại focus khi đóng, nên nơi gọi được chạy tiếp trễ một frame để giữ được focus mà nó tự đặt. */
const settle = (confirmed: boolean) => {
  const [current, ...rest] = queue;
  setQueue(rest);
  requestAnimationFrame(() => current.resolve(confirmed));
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
const getCurrent = () => queue[0] ?? null;
const getServerCurrent = () => null;

/** Thay cho window.alert; resolve khi người dùng đóng hộp thoại. */
export const showAlert = async (message: string, tone: DialogTone = 'error') => {
  await enqueue({ tone, message, confirmText: 'Đã hiểu' });
};

/** Thay cho window.confirm với các thao tác làm mất dữ liệu; resolve ra lựa chọn của người dùng. */
export const showConfirm = ({ cancelText = 'Hủy', ...options }: ConfirmOptions) =>
  enqueue({ tone: 'warning', cancelText, ...options });

/** Hiển thị các hộp thoại được yêu cầu qua `showAlert` và `showConfirm`. Chỉ mount một lần ở root layout. */
export const AppDialogHost: React.FC = () => {
  const request = useSyncExternalStore(subscribe, getCurrent, getServerCurrent);
  if (!request) return null;

  const { Icon, className } = TONES[request.tone];
  const isConfirm = request.cancelText !== undefined;

  return (
    // Nằm trên Modal (z-50) vì cảnh báo kiểm tra form mở chồng lên modal
    <Dialog key={request.id} open onClose={() => settle(false)} className="relative z-[60]">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-150 data-[closed]:opacity-0 motion-reduce:transition-none"
      />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <DialogPanel
            transition
            className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6 transition duration-150 data-[closed]:opacity-0 data-[closed]:scale-95 motion-reduce:transition-none"
          >
            <div className="flex items-start gap-3.5">
              <span className={`flex items-center justify-center w-9 h-9 rounded-full flex-shrink-0 ${className}`}>
                <Icon className="w-5 h-5" />
              </span>
              <div className="min-w-0 flex-1 pt-1.5">
                {request.title ? (
                  <>
                    <DialogTitle className="text-base font-bold text-text-primary tracking-tight">
                      {request.title}
                    </DialogTitle>
                    <Description className="mt-1.5 text-sm text-text-secondary leading-relaxed">
                      {request.message}
                    </Description>
                  </>
                ) : (
                  <DialogTitle as="p" className="text-sm text-text-primary leading-relaxed">
                    {request.message}
                  </DialogTitle>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              {isConfirm && (
                // Focus trước vào nút này để Enter không vô tình xác nhận thao tác làm mất dữ liệu
                <Button type="button" variant="secondary" data-autofocus onClick={() => settle(false)}>
                  {request.cancelText}
                </Button>
              )}
              <Button
                type="button"
                variant={isConfirm ? 'danger' : 'primary'}
                data-autofocus={isConfirm ? undefined : true}
                onClick={() => settle(true)}
              >
                {request.confirmText}
              </Button>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};
