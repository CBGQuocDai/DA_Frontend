'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';

export interface MultiSelectComboboxOption {
  id: number;
  name: string;
}

export interface MultiSelectComboboxProps {
  options: MultiSelectComboboxOption[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder = 'Tìm kiếm hoặc chọn...',
  disabled = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Map option lookup by ID
  const optionMap = useMemo(() => {
    const map = new Map<number, MultiSelectComboboxOption>();
    options.forEach((opt) => map.set(opt.id, opt));
    return map;
  }, [options]);

  // Filter options: not yet selected & matches search query
  const filteredOptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return options.filter((opt) => {
      const isSelected = selectedIds.includes(opt.id);
      if (isSelected) return false;
      if (!query) return true;
      return opt.name.toLowerCase().includes(query);
    });
  }, [options, selectedIds, searchQuery]);

  const handleSelect = (id: number) => {
    onChange([...selectedIds, id]);
    setSearchQuery('');
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  return (
    <div ref={containerRef} className={`relative space-y-2 ${className}`}>
      {/* Selected chips list */}
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {selectedIds.map((id) => {
            const opt = optionMap.get(id);
            const label = opt ? opt.name : `#${id}`;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-accent-light text-accent border border-accent/20 transition-all hover:bg-accent/15"
              >
                <span>{label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => handleRemove(id, e)}
                    className="hover:text-error hover:bg-error-light rounded-full p-0.5 text-accent transition-colors focus:outline-none"
                    aria-label={`Xóa ${label}`}
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </span>
            );
          })}
        </div>
      )}

      {/* Input container */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0].id);
              }
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-9 border border-border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
            disabled ? 'opacity-60 cursor-not-allowed bg-bg' : ''
          }`}
        />

        {/* Action / Arrow indicator icon */}
        <div
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-56 overflow-y-auto bg-surface border border-border rounded-lg shadow-lg py-1 text-sm focus:outline-none">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="px-3 py-2 hover:bg-accent-light hover:text-accent cursor-pointer transition-colors flex items-center justify-between group"
              >
                <span className="text-text-primary group-hover:text-accent font-medium">
                  {opt.name}
                </span>
                <span className="text-xs text-text-muted group-hover:text-accent/80">
                  + Thêm
                </span>
              </div>
            ))
          ) : (
            <div className="px-3 py-2.5 text-center text-xs text-text-muted">
              {options.length === 0
                ? 'Không có dữ liệu'
                : selectedIds.length === options.length
                ? 'Đã chọn tất cả'
                : 'Không tìm thấy kết quả phù hợp'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectCombobox;
