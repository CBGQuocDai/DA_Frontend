'use client';

import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants';
import { EmptyState } from '@/src/presentation/components/common';

export const BookDetailSkeleton: React.FC = () => (
  <div className="space-y-10 animate-pulse">
    <div className="h-4 w-64 bg-slate-200 rounded" />
    <div className="bg-white rounded-2xl border border-slate-200/90 p-8 flex flex-col md:flex-row gap-10">
      <div className="w-56 md:w-72 aspect-[3/4.2] rounded-2xl bg-slate-200 mx-auto md:mx-0" />
      <div className="flex-1 space-y-4">
        <div className="h-8 w-3/4 bg-slate-200 rounded" />
        <div className="h-4 w-1/3 bg-slate-200 rounded" />
        <div className="h-4 w-1/4 bg-slate-200 rounded" />
      </div>
    </div>
  </div>
);

export const BookDetailNotFound: React.FC = () => (
  <EmptyState
    title="Không tìm thấy sách"
    description="Sách có thể đã bị gỡ hoặc đường dẫn không đúng."
    action={
      <Link
        href={ROUTES.CUSTOMER.STORE}
        className="inline-flex px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md shadow-accent/30 transition-all"
      >
        Xem kho sách nói
      </Link>
    }
  />
);
