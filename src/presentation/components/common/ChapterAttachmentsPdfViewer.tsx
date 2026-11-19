'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Download } from 'lucide-react';
import { isAxiosError } from 'axios';
import { chapterService } from '@/src/infrastructure/api/services';
import { Spinner } from './Spinner';

interface ChapterAttachmentsPdfViewerProps {
  bookId: number;
  chapterId: number;
  chapterTitle: string;
  onClose: () => void;
}

type PdfState = { status: 'loading' } | { status: 'ready'; url: string } | { status: 'error'; message: string };

/**
 * Tệp đính kèm của một chương: file PDF ảnh và bảng do backend dựng từ nội dung đã lưu, chỉ tải khi mở.
 * Dùng chung cho admin và người nghe; file được tải kèm token để backend kiểm tra quyền rồi mở từ blob.
 * Phủ toàn màn hình; audio đang phát vẫn phát tiếp.
 */
export const ChapterAttachmentsPdfViewer: React.FC<ChapterAttachmentsPdfViewerProps> = ({
  bookId,
  chapterId,
  chapterTitle,
  onClose,
}) => {
  const [pdf, setPdf] = useState<PdfState>({ status: 'loading' });
  const closeRef = useRef<HTMLButtonElement>(null);
  // Trang cha render lại liên tục khi audio đang phát, nên giữ onClose trong ref để effect chỉ chạy một lần
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    chapterService
      .getAttachmentsPdf(bookId, chapterId)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPdf({ status: 'ready', url });
      })
      .catch((error) => {
        console.error('Error loading chapter attachments:', error);
        if (cancelled) return;
        const status = isAxiosError(error) ? error.response?.status : undefined;
        setPdf({
          status: 'error',
          message:
            status === 404
              ? 'Chương này không có tệp đính kèm.'
              : status === 403
                ? 'Mua sách để xem tệp đính kèm của chương này.'
                : 'Không tải được tệp đính kèm. Vui lòng thử lại sau.',
        });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [bookId, chapterId]);

  useEffect(() => {
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onCloseRef.current();
    };
    document.addEventListener('keydown', onKeyDown);
    // Khóa cuộn trang nền để chỉ nội dung tệp đính kèm cuộn
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  // Gắn vào body: phần tử cha có container query hay transform sẽ giam lớp phủ fixed bên trong nó
  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Tệp đính kèm của ${chapterTitle}`}
      className="fixed inset-0 z-[60] flex flex-col bg-slate-50"
    >
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-colors hover:bg-accent-light hover:text-accent"
          aria-label="Đóng tệp đính kèm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Tệp đính kèm</p>
          <h2 className="truncate text-sm font-bold text-slate-900 sm:text-base" title={chapterTitle}>
            {chapterTitle}
          </h2>
        </div>
        {pdf.status === 'ready' && (
          // Trình duyệt di động thường không hiển thị PDF trong khung, nên luôn có lối tải về
          <a
            href={pdf.url}
            download={`${chapterTitle} - tệp đính kèm.pdf`}
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-rose-200 hover:bg-accent-light hover:text-accent"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Tải PDF</span>
          </a>
        )}
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {pdf.status === 'loading' && <Spinner />}
        {pdf.status === 'error' && (
          <p className="px-4 text-center text-sm text-slate-500">{pdf.message}</p>
        )}
        {pdf.status === 'ready' && (
          <iframe src={pdf.url} title={`Tệp đính kèm của ${chapterTitle}`} className="h-full w-full border-0" />
        )}
      </div>
    </div>,
    document.body
  );
};
