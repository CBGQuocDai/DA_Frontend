'use client';

import React, { useState, useMemo } from 'react';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';
import { Check, ChevronDown, Search } from 'lucide-react';

export interface DropSearchOption {
  value: string | number;
  label: string;
}

export interface DropSearchProps {
  options: DropSearchOption[];
  value: string | number | null;
  onChange: (val: string | number | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  allLabel?: string;
  className?: string;
}

export const DropSearch: React.FC<DropSearchProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Tìm kiếm...',
  allLabel = 'Tất cả',
  className = '',
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  );

  const selected = options.find((o) => String(o.value) === String(value)) ?? null;

  return (
    <Listbox value={selected} onChange={(opt: DropSearchOption | null) => onChange(opt?.value ?? null)}>
      <div className={`relative ${className}`}>
        <ListboxButton className="w-full h-9 px-3 text-sm text-left bg-bg border border-border rounded-lg hover:border-border-light focus:outline-none focus:border-accent transition-colors flex items-center justify-between gap-2 data-[open]:border-accent">
          <span className={selected ? 'text-text-primary' : 'text-text-muted truncate'}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown className="w-4 h-4 text-text-muted ui-open:rotate-180 transition-transform shrink-0" />
        </ListboxButton>

        <ListboxOptions className="absolute z-50 top-full mt-1 left-0 right-0 bg-surface border border-border rounded-lg shadow-lg overflow-hidden focus:outline-none">
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 text-sm bg-bg border border-border rounded focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto py-1">
            <ListboxOption
              value={null}
              className="w-full px-3 py-2 text-sm text-left hover:bg-bg cursor-pointer data-[focus]:bg-bg data-[selected]:text-accent data-[selected]:font-medium text-text-secondary flex items-center justify-between"
            >
              {({ selected: isSelected }) => (
                <>
                  <span>{allLabel}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </>
              )}
            </ListboxOption>

            {filtered.length === 0 ? (
              <div className="px-3 py-2 text-sm text-text-muted">Không tìm thấy</div>
            ) : (
              filtered.map((opt) => (
                <ListboxOption
                  key={opt.value}
                  value={opt}
                  className="w-full px-3 py-2 text-sm text-left hover:bg-bg cursor-pointer data-[focus]:bg-bg data-[selected]:text-accent data-[selected]:font-medium text-text-primary flex items-center justify-between"
                >
                  {({ selected: isSelected }) => (
                    <>
                      <span className="truncate">{opt.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-accent shrink-0" />}
                    </>
                  )}
                </ListboxOption>
              ))
            )}
          </div>
        </ListboxOptions>
      </div>
    </Listbox>
  );
};

export default DropSearch;
