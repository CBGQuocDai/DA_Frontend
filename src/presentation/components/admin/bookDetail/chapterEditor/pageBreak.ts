import { Node, nodePasteRule, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { PAGE_BREAK_TEXT } from './plainText';

const insertPageBreak = (editor: Editor) =>
  editor.chain().focus().insertContent({ type: 'pageBreak' }).run();

/** Dấu ngắt trang của tài liệu, hiển thị thành khoảng hở giữa các tờ. */
export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML: () => [{ tag: 'div[data-page-break]' }],
  renderHTML: () => ['div', { 'data-page-break': '', title: 'Chọn rồi nhấn Delete để bỏ ngắt trang' }],
  renderText: () => PAGE_BREAK_TEXT,

  addKeyboardShortcuts() {
    return { 'Mod-Enter': () => insertPageBreak(this.editor) };
  },

  addPasteRules() {
    return [nodePasteRule({ find: /-{3,}\s*page_break\s*-{3,}/gi, type: this.type })];
  },
});

export { insertPageBreak };

/** Vị trí bắt đầu của từng trang không rỗng. */
export const getPageStarts = (doc: PMNode) => {
  const starts: number[] = [];
  let pageStart = 0;
  let pageHasText = false;
  doc.forEach((node, pos) => {
    if (node.type.name === 'pageBreak') {
      pageHasText = false;
      pageStart = pos + node.nodeSize;
    } else if (!pageHasText && node.textContent.trim()) {
      pageHasText = true;
      starts.push(pageStart);
    }
  });
  return starts.length ? starts : [0];
};

/** Chỉ số (từ 0) của trang chứa `pos`. */
export const getPageIndex = (starts: number[], pos: number) => {
  let index = 0;
  while (index + 1 < starts.length && starts[index + 1] <= pos) index++;
  return index;
};
