'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { HERO_BOOKS } from './heroBooks';

const arrowClass =
  'absolute top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-accent text-slate-700 hover:text-white backdrop-blur-md border border-slate-200 shadow-md transition-all active:scale-90';

const slotClass = {
  center: 'w-44 sm:w-56 md:w-64 h-64 sm:h-80 md:h-92 z-20 scale-105 sm:scale-110 -translate-y-2',
  left: 'w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-76 z-10 opacity-80 hover:opacity-100 scale-95 origin-bottom-right rotate-[-2deg]',
  right: 'w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-76 z-10 opacity-80 hover:opacity-100 scale-95 origin-bottom-left rotate-[2deg]',
};

/** "Sách cho mọi người" hero: three covers on a shelf, the middle one in the spotlight. */
export const HeroBookshelf: React.FC = () => {
  const [centerIndex, setCenterIndex] = useState(1);
  const count = HERO_BOOKS.length;

  const slotOf = (index: number): keyof typeof slotClass | null => {
    if (index === centerIndex) return 'center';
    if (index === (centerIndex - 1 + count) % count) return 'left';
    if (index === (centerIndex + 1) % count) return 'right';
    return null;
  };

  return (
    <section className="relative pt-6 pb-12 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-rose-200/35 via-pink-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-8 sm:mb-12 relative z-10">
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">SÁCH</h1>
        <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase mt-1">CHO MỌI NGƯỜI</h2>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-6 md:gap-8 pb-3">
          {HERO_BOOKS.map((book, index) => {
            const slot = slotOf(index);
            if (!slot) return null;
            return (
              <Link
                key={book.id}
                href={`${ROUTES.CUSTOMER.STORE}?search=${encodeURIComponent(book.title)}`}
                className={`transition-all duration-500 ease-out flex-shrink-0 group ${slotClass[slot]}`}
              >
                <div
                  className={`w-full h-full rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] border border-slate-200/90 ${
                    slot === 'center'
                      ? 'ring-4 ring-rose-500/20 shadow-2xl shadow-rose-900/15'
                      : 'shadow-lg shadow-slate-300/60'
                  }`}
                >
                  {book.cover}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="relative w-full max-w-3xl mx-auto -mt-2.5">
          <div className="h-4 sm:h-5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-t-sm border-t border-white shadow-inner" />
          <div className="h-3 sm:h-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-t border-amber-300/40 shadow-xl" />
          <div className="h-6 w-[94%] mx-auto bg-slate-400/25 blur-xl rounded-full -mt-1" />
        </div>

        <button
          type="button"
          onClick={() => setCenterIndex((i) => (i - 1 + count) % count)}
          className={`${arrowClass} left-2 sm:left-4`}
          aria-label="Sách trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCenterIndex((i) => (i + 1) % count)}
          className={`${arrowClass} right-2 sm:right-4`}
          aria-label="Sách kế tiếp"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
