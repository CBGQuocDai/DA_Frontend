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
import { ChapterImage, ChapterTable, insertTable } from './attachments';
import { EditorToolbar } from './EditorToolbar';
import { FindReplaceBar } from './FindReplaceBar';
import { getPageIndex, getPageStarts, PageBreak } from './pageBreak';
import { countWords, estimateAudioSeconds, hasFormatting, loadDoc, textToDoc } from './plainText';
import { SearchHighlight } from './searchHighlight';
import { goToPage } from './textCommands';

export interface ChapterTextEditorHandle {
  /** Thay toàn bộ tài liệu trong một bước undo, không báo qua `onChange` */
  resetContent: (content: string) => void;
}

interface ChapterTextEditorProps {
  handleRef?: React.Ref<ChapterTextEditorHandle>;
  initialContent: string;
  isFullscreen: boolean;
  /** Nhận tài liệu (JSON) sau mỗi thay đổi */
  onChange: (content: string) => void;
  onSave: () => void;
  onToggleFullscreen: () => void;
  /** Đặt ở đây để audio vẫn phát tiếp trong lúc chỉnh sửa */
  statusBarAudio?: React.ReactNode;
  statusBarEnd?: React.ReactNode;
}

// Các phím tắt Ctrl+Shift+L/E/R/J của nó sẽ chiếm mất hard reload và devtools khi trình soạn thảo đang focus
const ParagraphAlign = TextAlign.extend({ addKeyboardShortcuts: () => ({}) }).configure({ types: ['paragraph'] });

const getEditorText = (editor: { getText: (o: { blockSeparator: string }) => string }) =>
  editor.getText({ blockSeparator: '\n' });

/**
 * Trình soạn chương: các đoạn văn và dấu ngắt trang, định dạng bằng căn lề, đậm, nghiêng và
 * gạch chân, cùng ảnh và bảng OCR lấy từ sách. Tài liệu được lưu nguyên vẹn; backend lấy văn bản
 * cho TTS từ đó. Các trang hiển thị thành những tờ giấy xếp chồng; bộ công cụ nhắm tới việc dọn văn bản OCR.
 */
export const ChapterTextEditor: React.FC<ChapterTextEditorProps> = ({
  handleRef,
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
      ChapterImage,
      ChapterTable,
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
    // Quy tắc Markdown của các mark sẽ xóa mất dấu * và _ trong văn bản OCR mà TTS cần đọc nguyên văn
    enableInputRules: false,
    enablePasteRules: [PageBreak],
    content: loadDoc(initialContent),
    // Đồng thời dispatch transaction đầu tiên, nhờ đó `stats` bên dưới khác null
    autofocus: 'start',
    editorProps: {
      attributes: {
        class: 'chapter-editor outline-none text-text-primary font-sans',
        spellcheck: 'false',
      },
    },
    onUpdate: ({ editor }) => {
      setNotice(null);
      onChangeRef.current(JSON.stringify(editor.getJSON()));
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
      resetContent: (content) => {
        setNotice(null);
        editor?.chain().setContent(loadDoc(content), { emitUpdate: false }).focus('start').run();
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
    const doc = editor.getJSON();
    const hadFormatting = hasFormatting(doc);
    editor.chain().focus().setContent(textToDoc(cleaned, doc), { emitUpdate: true }).run();
    // Việc dọn dẹp viết lại cả dòng nên không còn gì để giữ định dạng
    if (hadFormatting) setNotice('Định dạng đã bị xoá. Nhấn Hoàn tác nếu cần lấy lại.');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Khi thanh tìm kiếm đang mở, Esc đóng thanh đó trước
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
        onInsertTable={() => insertTable(editor)}
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

      {/* Vùng soạn thảo: chương hiển thị như tờ giấy đặt trên bàn */}
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

      {/* Thanh trạng thái */}
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
