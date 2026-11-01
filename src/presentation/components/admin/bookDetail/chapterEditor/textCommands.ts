import type { Editor } from '@tiptap/core';
import { Selection, TextSelection } from '@tiptap/pm/state';
import { getPageStarts } from './pageBreak';

const lower = (text: string) => text.toLocaleLowerCase('vi');
const upper = (text: string) => text.toLocaleUpperCase('vi');

export const CASE_STYLES: { label: string; apply: (text: string) => string }[] = [
  { label: 'CHỮ HOA', apply: upper },
  { label: 'chữ thường', apply: lower },
  {
    label: 'Viết hoa đầu câu',
    apply: (text) => lower(text).replace(/(^\s*|[.!?…]\s+)(\p{L})/gu, (_, lead, char) => lead + upper(char)),
  },
  {
    label: 'Viết Hoa Mỗi Từ',
    apply: (text) => lower(text).replace(/(^|\s)(\p{L})/gu, (_, lead, char) => lead + upper(char)),
  },
];

/** Rewrites the selected text paragraph by paragraph, keeping the selection on the result. */
export const transformSelection = (editor: Editor, apply: (text: string) => string) => {
  const { doc, selection, tr } = editor.state;
  const { from, to } = selection;
  const ranges: { start: number; end: number; text: string }[] = [];
  doc.nodesBetween(from, to, (node, pos) => {
    if (!node.isText || !node.text) return;
    const start = Math.max(from, pos);
    const end = Math.min(to, pos + node.nodeSize);
    ranges.push({ start, end, text: node.text.slice(start - pos, end - pos) });
  });
  [...ranges].reverse().forEach(({ start, end, text }) => tr.insertText(apply(text), start, end));
  tr.setSelection(TextSelection.create(tr.doc, tr.mapping.map(from, -1), tr.mapping.map(to, 1)));
  editor.view.dispatch(tr);
  editor.commands.focus();
};

/**
 * Merges the selected paragraphs into one (or the current paragraph with the next when
 * nothing is selected). Blank lines are dropped; page breaks are never crossed.
 */
export const joinParagraphs = (editor: Editor) => {
  const { doc, selection, tr } = editor.state;
  const first = selection.$from.index(0);
  const last = Math.max(selection.$to.index(0), selection.empty ? first + 1 : first);

  const boundaries: number[] = [];
  doc.forEach((_, pos, index) => {
    if (index > first && index <= last) boundaries.push(pos);
  });

  boundaries.reverse().forEach((pos) => {
    const current = doc.nodeAt(pos);
    const before = doc.resolve(pos).nodeBefore;
    if (!current || !before || current.isAtom || before.isAtom) return;
    if (!current.textContent) {
      tr.delete(pos, pos + current.nodeSize);
    } else if (!before.textContent) {
      tr.delete(pos - before.nodeSize, pos);
    } else {
      tr.join(pos);
      tr.insertText(' ', pos - 1);
    }
  });

  if (tr.docChanged) editor.view.dispatch(tr);
  editor.commands.focus();
};

/** Moves the cursor to a page and scrolls its first line under the top of `scroller`. */
export const goToPage = (editor: Editor, page: number, scroller: HTMLElement | null) => {
  const { doc, tr } = editor.state;
  const pos = getPageStarts(doc)[page] ?? 0;
  editor.view.dispatch(tr.setSelection(Selection.near(doc.resolve(pos))));
  editor.view.focus();

  const target = editor.view.nodeDOM(pos);
  if (!scroller || !(target instanceof HTMLElement)) return;
  const offset = target.getBoundingClientRect().top - scroller.getBoundingClientRect().top;
  // Leaves room for the "Trang N" divider above the page
  scroller.scrollTop = page === 0 ? 0 : scroller.scrollTop + offset - 76;
};
