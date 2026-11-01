'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useEditorState, type Editor } from '@tiptap/react';
import { CaseSensitive, ChevronDown, ChevronUp, Replace, ReplaceAll, Search, X } from 'lucide-react';
import { getSearchState, gotoMatch, replaceAll, replaceCurrent, setSearch } from './searchHighlight';

interface FindReplaceBarProps {
  editor: Editor;
  initialQuery: string;
  onClose: () => void;
}

const iconButton =
  'p-1.5 rounded-md text-text-secondary hover:bg-bg hover:text-text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none';

export const FindReplaceBar: React.FC<FindReplaceBarProps> = ({ editor, initialQuery, onClose }) => {
  const [query, setQuery] = useState(initialQuery);
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const findInputRef = useRef<HTMLInputElement>(null);

  const search = useEditorState({
    editor,
    selector: ({ editor }) => {
      const state = getSearchState(editor);
      return { total: state?.matches.length ?? 0, current: state?.current ?? 0 };
    },
  });

  useEffect(() => {
    findInputRef.current?.select();
  }, []);

  useEffect(() => {
    setSearch(editor, query, caseSensitive);
    gotoMatch(editor, 0);
  }, [editor, query, caseSensitive]);

  // Clear highlights when the panel closes (the editor may already be gone)
  useEffect(
    () => () => {
      if (!editor.isDestroyed) setSearch(editor, '', false);
    },
    [editor]
  );

  const close = () => {
    onClose();
    editor.commands.focus();
  };

  const handleReplaceAll = () => {
    const count = replaceAll(editor, replacement);
    setNotice(count ? `Đã thay ${count} kết quả` : null);
  };

  const hasMatches = search.total > 0;

  return (
    <div
      className="flex flex-col gap-2 px-3 py-2.5 border-b border-border bg-surface"
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      }}
    >
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            ref={findInputRef}
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setNotice(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                gotoMatch(editor, e.shiftKey ? -1 : 1);
              }
            }}
            placeholder="Tìm trong chương..."
            className="w-full pl-8 pr-20 py-1.5 text-xs bg-bg border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-mono text-text-muted">
            {query ? (hasMatches ? `${search.current + 1}/${search.total}` : 'Không có') : ''}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setCaseSensitive((v) => !v)}
          className={`${iconButton} ${caseSensitive ? 'bg-accent-light text-accent' : ''}`}
          title="Phân biệt hoa/thường"
          aria-pressed={caseSensitive}
        >
          <CaseSensitive className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => gotoMatch(editor, -1)}
          disabled={!hasMatches}
          className={iconButton}
          title="Kết quả trước (Shift+Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => gotoMatch(editor, 1)}
          disabled={!hasMatches}
          className={iconButton}
          title="Kết quả tiếp (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
        <button type="button" onClick={close} className={iconButton} title="Đóng (Esc)">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="relative flex-1 min-w-0">
          <Replace className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            value={replacement}
            onChange={(e) => setReplacement(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                replaceCurrent(editor, replacement);
              }
            }}
            placeholder="Thay bằng..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-bg border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
          />
        </div>
        <button
          type="button"
          onClick={() => replaceCurrent(editor, replacement)}
          disabled={!hasMatches}
          className="px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-text-primary hover:bg-bg transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          Thay
        </button>
        <button
          type="button"
          onClick={handleReplaceAll}
          disabled={!hasMatches}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-md border border-border text-text-primary hover:bg-bg transition-colors disabled:opacity-40 disabled:pointer-events-none"
        >
          <ReplaceAll className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Thay tất cả</span>
        </button>
      </div>

      {notice && <p className="text-[11px] text-success">{notice}</p>}
    </div>
  );
};
