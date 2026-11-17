'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button } from '@/src/presentation/components/common';

interface BookSearchProps {
  keyword: string;
  onSearch: (keyword: string) => void;
}

export const BookSearch = ({ keyword, onSearch }: BookSearchProps) => {
  const [query, setQuery] = useState(keyword);

  return (
    <form
      role="search"
      aria-label="Tìm sách nói"
      onSubmit={(event) => { event.preventDefault(); onSearch(query.trim()); }}
      className="flex w-full max-w-xl gap-2"
    >
      <div className="relative min-w-0 flex-1">
        <label htmlFor="books-search" className="sr-only">Tìm kiếm theo tên sách</label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          id="books-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Tìm kiếm theo tên sách..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm text-slate-900 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/10 [&::-webkit-search-cancel-button]:appearance-none"
        />
        {(query || keyword) && (
          <button
            type="button"
            aria-label="Xóa tìm kiếm sách"
            onClick={() => { setQuery(''); onSearch(''); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <Button type="submit" className="shrink-0 rounded-xl">Tìm kiếm</Button>
    </form>
  );
};
