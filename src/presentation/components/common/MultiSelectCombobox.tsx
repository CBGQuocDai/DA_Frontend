"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useLayoutEffect,
  useMemo,
} from "react";

const MAX_RESULTS = 10;
const MAX_LIST_HEIGHT = 224;
const MIN_LIST_HEIGHT = 96;
/** Gap between input and list, plus breathing room from the clipping edge */
const LIST_OFFSET = 12;

interface ListPlacement {
  openUp: boolean;
  maxHeight: number;
}

/** Nearest scrolling ancestor's box (a modal body, say), or the viewport. */
const getClipBounds = (element: HTMLElement) => {
  for (let el = element.parentElement; el; el = el.parentElement) {
    const { overflowY } = getComputedStyle(el);
    if (overflowY === "auto" || overflowY === "scroll") {
      return el.getBoundingClientRect();
    }
  }
  return { top: 0, bottom: window.innerHeight };
};

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
  /**
   * Adds a "create" row at the bottom of the list; receives the typed text so the
   * create form can start from it.
   */
  onCreate?: (query: string) => void;
  /** Text of the create row, e.g. "Thêm tác giả" */
  createLabel?: string;
}

export const MultiSelectCombobox: React.FC<MultiSelectComboboxProps> = ({
  options,
  selectedIds,
  onChange,
  placeholder = "Tìm kiếm hoặc chọn...",
  disabled = false,
  className = "",
  onCreate,
  createLabel = "Thêm mới",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [placement, setPlacement] = useState<ListPlacement>({
    openUp: false,
    maxHeight: MAX_LIST_HEIGHT,
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Flip the list above the input when it would not fit below. Runs on open,
  // not on every keystroke, so the list does not jump sides while typing.
  useLayoutEffect(() => {
    if (!isOpen) return;

    const updatePlacement = () => {
      if (!inputRef.current || !listRef.current) return;
      const input = inputRef.current.getBoundingClientRect();
      const bounds = getClipBounds(inputRef.current);
      const spaceBelow = bounds.bottom - input.bottom - LIST_OFFSET;
      const spaceAbove = input.top - bounds.top - LIST_OFFSET;
      const needed = Math.min(listRef.current.scrollHeight, MAX_LIST_HEIGHT);
      const openUp = spaceBelow < needed && spaceAbove > spaceBelow;
      const maxHeight = Math.max(
        MIN_LIST_HEIGHT,
        Math.min(MAX_LIST_HEIGHT, openUp ? spaceAbove : spaceBelow),
      );
      setPlacement((prev) =>
        prev.openUp === openUp && prev.maxHeight === maxHeight
          ? prev
          : { openUp, maxHeight },
      );
    };

    const handleScroll = (event: Event) => {
      if (event.target !== listRef.current) updatePlacement();
    };

    updatePlacement();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", updatePlacement);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", updatePlacement);
    };
  }, [isOpen]);

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

  const visibleOptions = filteredOptions.slice(0, MAX_RESULTS);

  const handleSelect = (id: number) => {
    onChange([...selectedIds, id]);
    setSearchQuery("");
    setIsOpen(false);
  };

  const trimmedQuery = searchQuery.trim();
  const handleCreate = () => {
    onCreate?.(trimmedQuery);
    setSearchQuery("");
    setIsOpen(false);
    inputRef.current?.blur();
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
          onBlur={() => {
            setIsOpen(false);
            setSearchQuery("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setIsOpen(false);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (filteredOptions.length > 0) {
                handleSelect(filteredOptions[0].id);
              } else if (onCreate && trimmedQuery) {
                handleCreate();
              }
            }
          }}
          disabled={disabled}
          placeholder={placeholder}
          className={`w-full px-3 py-2 pr-9 border border-border rounded-md text-sm bg-surface text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
            disabled ? "opacity-60 cursor-not-allowed bg-bg" : ""
          }`}
        />

        {/* Action / Arrow indicator icon */}
        <div
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              inputRef.current?.focus();
            }
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-secondary transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>

        {/* Dropdown list */}
        {isOpen && (
          <div
            ref={listRef}
            onMouseDown={(e) => e.preventDefault()}
            style={{ maxHeight: placement.maxHeight }}
            className={`absolute left-0 right-0 z-50 overflow-y-auto overscroll-contain bg-surface border border-border rounded-lg shadow-lg text-sm focus:outline-none ${
              placement.openUp ? "bottom-full mb-1" : "top-full mt-1"
            }`}
          >
            {visibleOptions.length > 0 ? (
              visibleOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className="px-3 py-2 hover:bg-accent-light hover:text-accent cursor-pointer transition-colors flex items-center justify-between gap-3 group"
                >
                  <span className="min-w-0 truncate text-text-primary group-hover:text-accent font-medium">
                    {opt.name}
                  </span>
                  <span className="flex-shrink-0 text-xs text-text-muted group-hover:text-accent/80">
                    + Thêm
                  </span>
                </div>
              ))
            ) : (
              <div className="px-3 py-2.5 text-center text-xs text-text-muted">
                {options.length === 0
                  ? "Không có dữ liệu"
                  : selectedIds.length === options.length
                    ? "Đã chọn tất cả"
                    : "Không tìm thấy kết quả phù hợp"}
              </div>
            )}
            {(filteredOptions.length > MAX_RESULTS || onCreate) && (
              <div className="sticky bottom-0 border-t border-border bg-surface">
                {filteredOptions.length > MAX_RESULTS && (
                  <div className="px-3 py-1.5 text-center text-xs text-text-muted">
                    Hiển thị {MAX_RESULTS}/{filteredOptions.length} kết quả · nhập để
                    tìm thêm
                  </div>
                )}
                {onCreate && (
                  <button
                    type="button"
                    onClick={handleCreate}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium text-accent hover:bg-accent-light cursor-pointer transition-colors"
                  >
                    <svg
                      className="h-4 w-4 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeWidth="2" d="M12 5v14M5 12h14" />
                    </svg>
                    <span className="min-w-0 truncate">
                      {trimmedQuery ? `${createLabel} “${trimmedQuery}”` : createLabel}
                    </span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
