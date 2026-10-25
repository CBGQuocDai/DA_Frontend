'use client';

import React from 'react';
import { Headphones, Smartphone, X } from 'lucide-react';
import { useCopyToClipboard } from '@/src/presentation/hooks/common';
import { PAYMENT_BANK_INFO, buildVietQrUrl } from '@/src/shared/constants';
import type { Payment } from '@/src/shared/types';
import { formatVnd } from '@/src/shared/utils';
import { BookCover } from '../book';
import { Spinner } from '@/src/presentation/components/common';

interface PaymentModalProps {
  bookTitle: string;
  coverImage?: string;
  price: number;
  chapterCount: number;
  payment: Payment | null;
  isLoading: boolean;
  isPaid: boolean;
  error: string | null;
  onStartListening: () => void;
  onClose: () => void;
}

const CopyButton: React.FC<{ copied: boolean; onClick: () => void; disabled?: boolean; accent?: boolean }> = ({
  copied,
  onClick,
  disabled,
  accent,
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`px-2 py-1 rounded text-[11px] font-semibold transition-colors whitespace-nowrap disabled:opacity-50 ${
      accent ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
    }`}
  >
    {copied ? 'Đã chép ✓' : 'Sao chép'}
  </button>
);

const PaymentSuccess: React.FC<{ bookTitle: string; chapterCount: number; onStartListening: () => void }> = ({
  bookTitle,
  chapterCount,
  onStartListening,
}) => (
  <div className="py-6 text-center space-y-4">
    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
      ✓
    </div>
    <div>
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
        <span className="w-2 h-2 rounded-full bg-emerald-600" />
        Thanh toán thành công
      </div>
      <h4 className="text-base font-bold text-slate-900 mt-2">Mở khóa thành công sách nói!</h4>
      <p className="text-xs text-slate-600 mt-1 px-4">
        Chúc mừng bạn đã sở hữu trọn bộ {chapterCount} chương audio của cuốn sách{' '}
        <span className="font-semibold text-slate-900">“{bookTitle}”</span>.
      </p>
    </div>
    <button
      type="button"
      onClick={onStartListening}
      className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all flex items-center justify-center gap-2"
    >
      <span>Bắt đầu nghe sách ngay</span>
      <Headphones className="w-4 h-4" />
    </button>
  </div>
);

/** SePay / VietQR checkout: QR code, transfer details and the auto-detected payment status. */
export const PaymentModal: React.FC<PaymentModalProps> = ({
  bookTitle,
  coverImage,
  price,
  chapterCount,
  payment,
  isLoading,
  isPaid,
  error,
  onStartListening,
  onClose,
}) => {
  const { copiedKey, copy } = useCopyToClipboard();
  const amount = Number(payment?.amount ?? price);
  const paymentCode = payment?.paymentCode ?? '';
  const qrUrl = payment?.qrUrl || (paymentCode ? buildVietQrUrl(amount, paymentCode) : '');

  const rows = [
    { key: 'holder', label: 'Chủ tài khoản:', value: PAYMENT_BANK_INFO.ACCOUNT_HOLDER },
    { key: 'account', label: 'Số tài khoản:', value: PAYMENT_BANK_INFO.ACCOUNT_NUMBER, mono: true },
    { key: 'amount', label: 'Số tiền:', value: String(amount), display: formatVnd(amount), highlight: true },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-5 sm:p-7 relative max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3 pb-3 border-b border-slate-100">
          <div className="w-12 h-16 rounded-lg flex-shrink-0 shadow-sm overflow-hidden">
            <BookCover title={bookTitle} coverImage={coverImage} />
          </div>
          <div className="pr-6 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-light px-2 py-0.5 rounded">
              Thanh toán VietQR 24/7
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mt-1 line-clamp-1">{bookTitle}</h3>
            <p className="text-xs font-extrabold text-accent mt-0.5">{formatVnd(price)}</p>
          </div>
        </div>

        {isPaid ? (
          <PaymentSuccess bookTitle={bookTitle} chapterCount={chapterCount} onStartListening={onStartListening} />
        ) : (
          <>
            <div className="text-center bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 mt-4">
              {isLoading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-3 text-rose-500">
                  <Spinner className="w-8 h-8" />
                  <span className="text-xs text-slate-500 font-medium">Đang tải mã thanh toán...</span>
                </div>
              ) : error ? (
                <p className="py-10 text-sm text-accent-hover font-medium">{error}</p>
              ) : (
                <>
                  {qrUrl && (
                    <div className="inline-block bg-white p-2.5 rounded-xl border border-slate-200 shadow-md">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={qrUrl}
                        alt="Mã QR thanh toán VietQR"
                        className="w-56 h-auto sm:w-64 max-w-full mx-auto rounded-lg object-contain"
                      />
                    </div>
                  )}
                  <p className="text-[11px] text-slate-500 mt-2.5 font-medium flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Mở app Ngân hàng bất kỳ để quét mã QR chuyển khoản</span>
                  </p>
                </>
              )}
            </div>

            {!error && (
              <>
                <div className="mt-3.5 bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-medium">Ngân hàng:</span>
                    <span className="font-bold text-slate-900">{PAYMENT_BANK_INFO.BANK_NAME}</span>
                  </div>

                  {rows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500 font-medium">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded border ${
                            row.highlight
                              ? 'font-mono text-sm text-accent bg-accent-light border-rose-200'
                              : `text-slate-900 bg-white border-slate-200 ${row.mono ? 'font-mono' : 'uppercase tracking-wide'}`
                          }`}
                        >
                          {row.display ?? row.value}
                        </span>
                        <CopyButton copied={copiedKey === row.key} onClick={() => copy(row.value, row.key)} />
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between bg-amber-50/80 p-2 rounded-lg border border-amber-200/70">
                    <div>
                      <span className="text-amber-900 font-bold block">Nội dung CK:</span>
                      <span className="text-[10px] text-amber-700">Vui lòng nhập đúng mã</span>
                    </div>
                    <div className="flex items-center gap-2 max-w-[65%]">
                      <span
                        className="font-bold font-mono text-amber-950 bg-white px-2 py-1 rounded border border-amber-300 truncate"
                        title={paymentCode}
                      >
                        {paymentCode || 'Đang lấy mã...'}
                      </span>
                      <CopyButton
                        accent
                        disabled={!paymentCode}
                        copied={copiedKey === 'code'}
                        onClick={() => copy(paymentCode, 'code')}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 py-2 px-3 bg-amber-50/80 text-amber-800 text-[11px] rounded-xl border border-amber-200/80 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>Trạng thái: Đang chờ chuyển khoản (Tự động nhận diện)</span>
                </div>
              </>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
