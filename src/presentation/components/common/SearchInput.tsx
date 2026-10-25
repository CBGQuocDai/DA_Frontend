'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Text search box with a leading icon and a clear button. */
export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className = '' }) => (
  <div className={`relative ${className}`}>
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-9 pr-8 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors h-10"
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
    {value && (
      <button
        type="button"
        onClick={() => onChange('')}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary rounded-full hover:bg-black/5 transition-colors cursor-pointer"
        aria-label="Xóa tìm kiếm"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);
