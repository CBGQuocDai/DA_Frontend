'use client';

import React from 'react';
import Link from 'next/link';
import { TriangleAlert } from 'lucide-react';
import { Spinner } from '@/src/presentation/components/common';

export const AuthAlert: React.FC<{ message: string }> = ({ message }) => (
  <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-start gap-2.5">
    <TriangleAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
    <p className="font-medium">{message}</p>
  </div>
);

interface AuthSubmitButtonProps {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
}

export const AuthSubmitButton: React.FC<AuthSubmitButtonProps> = ({ isLoading, loadingText, children }) => (
  <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 px-4 rounded-xl bg-accent hover:bg-accent-hover text-white font-semibold text-sm transition-all shadow-md shadow-accent/25 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-2 flex items-center justify-center gap-2"
  >
    {isLoading ? (
      <>
        <Spinner />
        <span>{loadingText}</span>
      </>
    ) : (
      children
    )}
  </button>
);

interface AuthSwitchLinkProps {
  prompt: string;
  href: string;
  label: string;
}

export const AuthSwitchLink: React.FC<AuthSwitchLinkProps> = ({ prompt, href, label }) => (
  <div className="mt-6 text-center text-xs text-slate-500">
    {prompt}{' '}
    <Link
      href={href}
      className="font-semibold text-accent hover:text-accent-hover hover:underline transition-colors"
    >
      {label}
    </Link>
  </div>
);

export const AuthTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="text-center mb-7">
    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{children}</h1>
  </div>
);
