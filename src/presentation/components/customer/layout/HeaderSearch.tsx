'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';

export const HeaderSearch: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = query.trim();
    if (!keyword) return;
    router.push(`${ROUTES.CUSTOMER.STORE}?search=${encodeURIComponent(keyword)}`);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-slate-600 hover:text-accent hover:bg-accent-light transition-colors"
        aria-label="Tìm kiếm"
      >
        <Search className="w-5 h-5" />
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center bg-slate-50 border border-slate-300 rounded-full px-3 py-1.5 w-60 sm:w-72 shadow-sm focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all"
    >
      <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
      <input
        autoFocus
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm sách nói, truyện audio..."
        className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
      />
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
        aria-label="Đóng tìm kiếm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </form>
  );
};
