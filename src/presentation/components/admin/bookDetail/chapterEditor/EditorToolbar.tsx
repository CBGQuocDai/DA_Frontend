'use client';

import React from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import type { Editor } from '@tiptap/react';
import {
  ALargeSmall,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Combine,
  Italic,
  Maximize2,
  Minimize2,
  Omega,
  Redo2,
  Search,
  SeparatorHorizontal,
  Underline,
  Undo2,
  WandSparkles,
} from 'lucide-react';
import { insertPageBreak } from './pageBreak';
import { joinBrokenLines, normalizeText, removeBlankLines } from './plainText';
import { CASE_STYLES, joinParagraphs, transformSelection } from './textCommands';

const MARKS = [
  { name: 'bold', label: 'In đậm', shortcut: 'Ctrl+B', Icon: Bold },
  { name: 'italic', label: 'In nghiêng', shortcut: 'Ctrl+I', Icon: Italic },
  { name: 'underline', label: 'Gạch chân', shortcut: 'Ctrl+U', Icon: Underline },
] as const;

const ALIGNMENTS = [
  { value: 'left', label: 'Căn trái', Icon: AlignLeft },
  { value: 'center', label: 'Căn giữa', Icon: AlignCenter },
  { value: 'right', label: 'Căn phải', Icon: AlignRight },
  { value: 'justify', label: 'Căn đều hai bên', Icon: AlignJustify },
];

const SPECIAL_CHARACTERS = ['“', '”', '‘', '’', '«', '»', '—', '–', '…', '•', '°', '№'];

const CLEANUPS: { label: string; description: string; apply: (text: string) => string }[] = [
  {
    label: 'Chuẩn hoá văn bản',
    description: 'Sửa dấu tiếng Việt, khoảng trắng thừa và dòng trống liên tiếp',
    apply: normalizeText,
  },
  {
    label: 'Nối dòng bị ngắt',
    description: 'Ghép các dòng bị xuống hàng giữa câu khi quét từ PDF',
    apply: joinBrokenLines,
  },
  {
    label: 'Xoá dòng trống',
    description: 'Bỏ mọi dòng trống giữa các đoạn văn',
    apply: removeBlankLines,
  },
];

const toolButton =
  'inline-flex items-center gap-1 @4xl:gap-1.5 h-8 px-1.5 @4xl:px-2 rounded-md text-xs font-medium text-text-secondary hover:bg-bg hover:text-text-primary data-[open]:bg-bg data-[open]:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-40 disabled:pointer-events-none';
const menuPanel =
  'z-50 rounded-lg border border-border bg-surface shadow-lg p-1 focus:outline-none';
const menuItem =
  'w-full text-left px-2.5 py-1.5 rounded-md text-xs text-text-primary data-[focus]:bg-accent-light data-[focus]:text-accent data-[disabled]:opacity-40';

const Divider = () => <span className="w-px h-5 bg-border mx-0.5 @4xl:mx-1" aria-hidden />;

/** Headless UI hands focus back to the menu button on close, so editor commands run a frame later. */
const afterMenuCloses = (action: () => void) => () => requestAnimationFrame(action);

interface EditorToolbarProps {
  editor: Editor;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  page: number;
  totalPage: number;
  align: string;
  activeMarks: Record<(typeof MARKS)[number]['name'], boolean>;
  isFindOpen: boolean;
  isFullscreen: boolean;
  onToggleFind: () => void;
  onCleanup: (apply: (text: string) => string) => void;
  onPageChange: (page: number) => void;
  onToggleFullscreen: () => void;
}

export const EditorToolbar: React.FC<EditorToolbarProps> = ({
  editor,
  canUndo,
  canRedo,
  hasSelection,
  page,
  totalPage,
  align,
  activeMarks,
  isFindOpen,
  isFullscreen,
  onToggleFind,
  onCleanup,
  onPageChange,
  onToggleFullscreen,
}) => (
  <div className="flex items-center gap-0.5 px-2 py-1 border-b border-border bg-surface flex-shrink-0 flex-wrap">
    <button
      type="button"
      onClick={() => editor.chain().focus().undo().run()}
      disabled={!canUndo}
      className={toolButton}
      title="Hoàn tác (Ctrl+Z)"
      aria-label="Hoàn tác"
    >
      <Undo2 className="w-4 h-4" />
    </button>
    <button
      type="button"
      onClick={() => editor.chain().focus().redo().run()}
      disabled={!canRedo}
      className={toolButton}
      title="Làm lại (Ctrl+Shift+Z)"
      aria-label="Làm lại"
    >
      <Redo2 className="w-4 h-4" />
    </button>

    <Divider />

    <button
      type="button"
      onClick={onToggleFind}
      className={`${toolButton} ${isFindOpen ? 'bg-accent-light text-accent' : ''}`}
      title="Tìm và thay thế (Ctrl+F)"
      aria-label="Tìm và thay thế"
    >
      <Search className="w-4 h-4" />
      <span className="hidden @5xl:inline">Tìm & thay thế</span>
    </button>

    <Divider />

    <Menu>
      <MenuButton className={toolButton} title="Đổi kiểu chữ của đoạn đang chọn" aria-label="Đổi kiểu chữ">
        <ALargeSmall className="w-4 h-4" />
        <span className="hidden @5xl:inline">Kiểu chữ</span>
        <ChevronDown className="w-3 h-3" />
      </MenuButton>
      <MenuItems anchor={{ to: 'bottom start', gap: 4 }} className={`${menuPanel} w-44`}>
        {CASE_STYLES.map(({ label, apply }) => (
          <MenuItem key={label} disabled={!hasSelection}>
            <button
              type="button"
              className={menuItem}
              onClick={afterMenuCloses(() => transformSelection(editor, apply))}
            >
              {label}
            </button>
          </MenuItem>
        ))}
        {!hasSelection && (
          <p className="px-2.5 pt-1.5 pb-1 text-[11px] text-text-muted border-t border-border-light mt-1">
            Bôi đen đoạn chữ cần đổi trước.
          </p>
        )}
      </MenuItems>
    </Menu>
    <button
      type="button"
      onClick={() => joinParagraphs(editor)}
      className={toolButton}
      title="Nối các đoạn đang chọn thành một, hoặc nối đoạn hiện tại với đoạn sau"
      aria-label="Nối đoạn"
    >
      <Combine className="w-4 h-4" />
      <span className="hidden @5xl:inline">Nối đoạn</span>
    </button>

    <Divider />

    {MARKS.map(({ name, label, shortcut, Icon }) => (
      <button
        key={name}
        type="button"
        onClick={() => editor.chain().focus().toggleMark(name).run()}
        className={`${toolButton} ${activeMarks[name] ? 'bg-accent-light text-accent' : ''}`}
        title={`${label} (${shortcut})`}
        aria-label={label}
        aria-pressed={activeMarks[name]}
      >
        <Icon className="w-4 h-4" />
      </button>
    ))}

    <Divider />

    {ALIGNMENTS.map(({ value, label, Icon }) => (
      <button
        key={value}
        type="button"
        onClick={() => editor.chain().focus().setTextAlign(value).run()}
        className={`${toolButton} ${align === value ? 'bg-accent-light text-accent' : ''}`}
        title={label}
        aria-label={label}
        aria-pressed={align === value}
      >
        <Icon className="w-4 h-4" />
      </button>
    ))}

    <Divider />

    <button
      type="button"
      onClick={() => insertPageBreak(editor)}
      className={toolButton}
      title="Chèn ngắt trang tại con trỏ (Ctrl+Enter)"
      aria-label="Chèn ngắt trang"
    >
      <SeparatorHorizontal className="w-4 h-4" />
      <span className="hidden @5xl:inline">Ngắt trang</span>
    </button>
    <Menu>
      <MenuButton className={toolButton} title="Chèn ký tự đặc biệt" aria-label="Chèn ký tự đặc biệt">
        <Omega className="w-4 h-4" />
        <ChevronDown className="w-3 h-3" />
      </MenuButton>
      <MenuItems anchor={{ to: 'bottom start', gap: 4 }} className={`${menuPanel} grid grid-cols-6 gap-0.5`}>
        {SPECIAL_CHARACTERS.map((character) => (
          <MenuItem key={character}>
            <button
              type="button"
              className="w-8 h-8 rounded-md text-sm text-text-primary data-[focus]:bg-accent-light data-[focus]:text-accent"
              onClick={afterMenuCloses(() => editor.chain().focus().insertContent(character).run())}
            >
              {character}
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>

    <Divider />

    <Menu>
      <MenuButton className={toolButton} title="Làm sạch toàn bộ văn bản. Có thể hoàn tác." aria-label="Làm sạch">
        <WandSparkles className="w-4 h-4" />
        <span className="hidden @5xl:inline">Làm sạch</span>
        <ChevronDown className="w-3 h-3" />
      </MenuButton>
      <MenuItems anchor={{ to: 'bottom start', gap: 4 }} className={`${menuPanel} w-72`}>
        {CLEANUPS.map(({ label, description, apply }) => (
          <MenuItem key={label}>
            <button type="button" className={menuItem} onClick={afterMenuCloses(() => onCleanup(apply))}>
              <span className="block font-medium">{label}</span>
              <span className="block text-[11px] text-text-secondary mt-0.5">{description}</span>
            </button>
          </MenuItem>
        ))}
      </MenuItems>
    </Menu>

    <div className="ml-auto flex items-center gap-1">
      {totalPage > 1 && (
        <select
          value={page}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="h-8 px-1.5 text-xs font-medium text-text-primary bg-surface border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent/50"
          title="Đi tới trang"
          aria-label="Đi tới trang"
        >
          {Array.from({ length: totalPage }, (_, i) => (
            <option key={i} value={i}>
              Trang {i + 1} / {totalPage}
            </option>
          ))}
        </select>
      )}
      <button
        type="button"
        onClick={onToggleFullscreen}
        className={toolButton}
        title={isFullscreen ? 'Thoát toàn màn hình (Esc)' : 'Sửa toàn màn hình'}
        aria-label={isFullscreen ? 'Thoát toàn màn hình' : 'Sửa toàn màn hình'}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>
    </div>
  </div>
);
