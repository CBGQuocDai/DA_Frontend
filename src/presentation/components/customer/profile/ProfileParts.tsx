'use client';

import React from 'react';
import { Spinner } from '@/src/presentation/components/common';

export const TabHeader: React.FC<{
  eyebrow: string;
  title: string;
  description?: string;
  aside?: React.ReactNode;
}> = ({ eyebrow, title, description, aside }) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
    <div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-accent-light px-2 py-0.5 rounded">
        {eyebrow}
      </span>
      <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1.5 uppercase">{title}</h1>
      {description && <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{description}</p>}
    </div>
    {aside}
  </div>
);

export type FormMessage = { type: 'success' | 'error'; text: string };

export const FormNotice: React.FC<{ message: FormMessage }> = ({ message }) => (
  <div
    className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
      message.type === 'success'
        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
        : 'bg-red-50 border-red-200 text-red-700'
    }`}
  >
    <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
    <span>{message.text}</span>
  </div>
);

export const profileInputClass =
  'w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed';

export const ProfileField: React.FC<{ label: string; required?: boolean; children: React.ReactNode }> = ({
  label,
  required,
  children,
}) => (
  <label className="space-y-1.5 block">
    <span className="text-xs font-bold text-slate-700 block">
      {label} {required && <span className="text-rose-500">*</span>}
    </span>
    {children}
  </label>
);

export const SubmitButton: React.FC<{ isLoading: boolean; loadingText: string; children: React.ReactNode }> = ({
  isLoading,
  loadingText,
  children,
}) => (
  <button
    type="submit"
    disabled={isLoading}
    className="px-7 py-2.5 rounded-xl bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-xs font-bold shadow-md shadow-accent/30 transition-all flex items-center gap-2"
  >
    {isLoading ? (
      <>
        <Spinner className="w-3.5 h-3.5" />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);
