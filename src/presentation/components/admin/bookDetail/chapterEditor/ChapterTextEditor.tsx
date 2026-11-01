'use client';

import React, { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import Bold from '@tiptap/extension-bold';
import Document from '@tiptap/extension-document';
import Italic from '@tiptap/extension-italic';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { TextAlign } from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Focus, Gapcursor, Placeholder, UndoRedo } from '@tiptap/extensions';
import { formatDuration } from '@/src/shared/utils';
import { EditorToolbar } from './EditorToolbar';
import { FindReplaceBar } from './FindReplaceBar';
import { getPageIndex, getPageStarts, PageBreak } from './pageBreak';
import { countWords, estimateAudioSeconds, loadDoc, serializeDoc, textToDoc } from './plainText';
import { SearchHighlight } from './searchHighlight';
import { goToPage } from './textCommands';

export interface ChapterTextEditorHandle {
  /** Replaces the document as one undoable step, without reporting it through `onChange` */
  resetContent: (text: string, content: string) => void;
}

interface ChapterTextEditorProps {
  handleRef?: React.Ref<ChapterTextEditorHandle>;
  initialText: string;
  initialContent: string;
  isFullscreen: boolean;
  onChange: (text: string, content: string) => void;
  onSave: () => void;
  onToggleFullscreen: () => void;
  /** Lives here so it keeps playing during edits */
  statusBarAudio?: React.ReactNode;
  statusBarEnd?: React.ReactNode;
}

// Its Ctrl+Shift+L/E/R/J shortcuts would take over hard reload and devtools while the editor has focus
const ParagraphAlign = TextAlign.extend({ addKeyboardShortcuts: () => ({}) }).configure({ types: ['paragraph'] });

const getEditorText = (editor: { getText: (o: { blockSeparator: string }) => string }) =>
  editor.getText({ blockSeparator: '\n' });

/**
 * Chapter editor: paragraphs and page breaks, formatted with alignment, bold, italic and
 * underline. The plain text goes to TTS; the formatted document is saved next to it. Pages
 * render as stacked sheets; the tools target OCR cleanup.
 */
export const ChapterTextEditor: React.FC<ChapterTextEditorProps> = ({
  handleRef,
  initialText,
  initialContent,
  isFullscreen,
  onChange,
  onSave,
  onToggleFullscreen,
  statusBarAudio,
  statusBarEnd,
}) => {
  const [findSession, setFindSession] = useState<{ id: number; query: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      Document,
      Paragraph,
      Text,
      PageBreak,
      UndoRedo,
      Gapcursor,
      Focus.configure({ mode: 'shallowest' }),
      Placeholder.configure({ placeholder: 'Nhập hoặc dán nội dung chữ của chương...' }),
      SearchHighlight,
      ParagraphAlign,
      Bold,
      Italic,
      Underline,
    ],
    // The marks' Markdown rules would strip the * and _ from OCR text that TTS must read as is
    enableInputRules: false,
    enablePasteRules: [PageBreak],
    content: loadDoc(initialContent, initialText),
    // Also dispatches the first transaction, which is what makes `stats` below non-null
    autofocus: 'start',
    editorProps: {
      attributes: {
        class: 'chapter-editor outline-none text-text-primary font-sans',
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      setNotice(null);
      onChangeRef.current(getEditorText(editor), serializeDoc(editor.getJSON()));
    },
  });

  const stats = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return null;
      const text = getEditorText(editor);
      const { doc, selection } = editor.state;
      const pageStarts = getPageStarts(doc);
      let paragraphs = 0;
      doc.forEach((node) => {
        if (node.type.name === 'paragraph' && node.textContent.trim()) paragraphs++;
      });
      return {
        canUndo: editor.can().undo(),
        canRedo: editor.can().redo(),
        words: countWords(text),
        chars: doc.textContent.length,
        paragraphs,
        page: getPageIndex(pageStarts, selection.from),
        align: (selection.$from.parent.attrs.textAlign as string | null) ?? 'left',
        isBold: editor.isActive('bold'),
        isItalic: editor.isActive('italic'),
        isUnderline: editor.isActive('underline'),
        totalPage: pageStarts.length,
        selectedWords: selection.empty ? 0 : countWords(doc.textBetween(selection.from, selection.to, ' ')),
        estimatedSeconds: estimateAudioSeconds(text),
      };
    },
  });

  useImperativeHandle(
    handleRef,
    () => ({
      resetContent: (text, content) => {
        setNotice(null);
        editor?.chain().setContent(loadDoc(content, text), { emitUpdate: false }).focus('start').run();
      },
    }),
    [editor]
  );

  if (!editor || !stats) return null;

  const openFind = () => {
    const { from, to } = editor.state.selection;
    const selected = editor.state.doc.textBetween(from, to, ' ');
    setFindSession((prev) => ({ id: (prev?.id ?? 0) + 1, query: selected || '' }));
  };

  const runCleanup = (apply: (text: string) => string) => {
    const text = getEditorText(editor);
    const cleaned = apply(text);
    if (cleaned === text) {
      setNotice('Không có gì cần đổi');
      editor.commands.focus();
      return;
    }
    const hadFormatting = !!serializeDoc(editor.getJSON());
    editor.chain().focus().setContent(textToDoc(cleaned), { emitUpdate: true }).run();
    // Cleanup rewrites whole lines, so there is nothing left to carry the formatting on
    if (hadFormatting) setNotice('Định dạng đã bị xoá. Nhấn Hoàn tác nếu cần lấy lại.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // With the find bar open, Esc closes that first
    if (e.key === 'Escape' && isFullscreen && !findSession) {
      onToggleFullscreen();
      return;
    }
    if (!(e.ctrlKey || e.metaKey)) return;
    const key = e.key.toLowerCase();
    if (key === 's') {
      e.preventDefault();
      onSave();
    } else if (key === 'f' || key === 'h') {
      e.preventDefault();
      openFind();
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-surface" onKeyDown={handleKeyDown}>
      <EditorToolbar
        editor={editor}
        canUndo={stats.canUndo}
        canRedo={stats.canRedo}
        hasSelection={stats.selectedWords > 0}
        page={stats.page}
        align={stats.align}
        activeMarks={{ bold: stats.isBold, italic: stats.isItalic, underline: stats.isUnderline }}
        totalPage={stats.totalPage}
        isFindOpen={!!findSession}
        isFullscreen={isFullscreen}
        onToggleFind={() => (findSession ? setFindSession(null) : openFind())}
        onCleanup={runCleanup}
        onPageChange={(page) => goToPage(editor, page, scrollerRef.current)}
        onToggleFullscreen={onToggleFullscreen}
      />

      {findSession && (
        <FindReplaceBar
          key={findSession.id}
          editor={editor}
          initialQuery={findSession.query}
          onClose={() => setFindSession(null)}
        />
      )}

      {/* Writing surface: the chapter as a sheet of paper on the desk */}
      <div
        ref={scrollerRef}
        className="flex-1 min-h-0 flex flex-col overflow-y-auto bg-bg px-2 sm:px-6 py-2 sm:py-3 cursor-text"
        onClick={(e) => {
          if (e.target === e.currentTarget) editor.commands.focus('end');
        }}
      >
        <div
          className="chapter-sheet flex-grow flex-shrink-0 w-full max-w-[46rem] mx-auto bg-surface border border-border rounded-sm shadow-sm text-base leading-8"
        >
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-x-4 gap-y-1 flex-wrap px-3 py-1 border-t border-border bg-surface text-[11px] text-text-secondary tabular-nums flex-shrink-0">
        {stats.totalPage > 1 && (
          <span className="font-medium text-text-primary">
            Trang {stats.page + 1}/{stats.totalPage}
          </span>
        )}
        <span>{stats.words.toLocaleString('vi-VN')} từ</span>
        <span>{stats.chars.toLocaleString('vi-VN')} ký tự</span>
        <span>{stats.paragraphs.toLocaleString('vi-VN')} đoạn văn</span>
        {stats.selectedWords > 0 && (
          <span className="text-accent font-medium">Đã chọn {stats.selectedWords.toLocaleString('vi-VN')} từ</span>
        )}
        {notice && <span className="text-success font-medium">{notice}</span>}
        {statusBarAudio}
        <span className="ml-auto" title="Ước tính ở tốc độ đọc 1.0x">
          Khoảng {formatDuration(stats.estimatedSeconds) ?? '0s'} audio
        </span>
        {statusBarEnd}
      </div>
    </div>
  );
};
