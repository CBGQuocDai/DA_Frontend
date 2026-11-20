import { Node, type Editor } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { ImageNodeView } from './ImageNodeView';
import { TableNodeView } from './TableNodeView';
import { IMAGE_TEXT, TABLE_TEXT } from './plainText';

/**
 * Ảnh OCR lấy ra từ sách. `path` là vị trí trên storage, `src` là URL ký sẵn backend gắn vào mỗi
 * lần tải chương. TTS không đọc ảnh mà đọc câu `IMAGE_TEXT`. `caption` do admin nhập (OCR không sinh),
 * in làm tiêu đề của ảnh trong file PDF tệp đính kèm.
 */
export const ChapterImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      path: { default: '', parseHTML: (el) => el.getAttribute('data-path') ?? '', renderHTML: () => ({}) },
      src: { default: null, parseHTML: (el) => el.querySelector('img')?.getAttribute('src'), renderHTML: () => ({}) },
      description: {
        default: '',
        parseHTML: (el) => el.querySelector('img')?.getAttribute('alt') ?? '',
        renderHTML: () => ({}),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.querySelector('figcaption')?.textContent ?? '',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML: () => [{ tag: 'figure[data-chapter-image]' }],
  renderHTML: ({ node }) => [
    'figure',
    { 'data-chapter-image': '', 'data-path': node.attrs.path, title: 'Ảnh đính kèm, TTS không đọc' },
    ['img', { src: node.attrs.src ?? '', alt: node.attrs.description, draggable: 'false' }],
    ['figcaption', node.attrs.caption ?? ''],
  ],
  renderText: () => IMAGE_TEXT,

  addNodeView() {
    return ReactNodeViewRenderer(ImageNodeView, {
      // Ô chú thích tự xử lý phím và chuột; nếu không trình soạn sẽ nuốt phím gõ trong ô
      stopEvent: ({ event }) => event.target instanceof Element && !!event.target.closest('[data-caption-control]'),
    });
  },
});

/**
 * Bảng đính kèm, do OCR lấy ra từ sách hoặc admin chèn tay: TTS đọc câu `TABLE_TEXT` thay cho nội dung bảng.
 * Trong trình soạn bảng hiển thị bằng `TableNodeView` để sửa được từng ô và chú thích (`caption`).
 */
export const ChapterTable = Node.create({
  name: 'table',
  group: 'block',
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      rows: {
        default: [],
        parseHTML: (el) => JSON.parse(el.getAttribute('data-rows') ?? '[]'),
        renderHTML: () => ({}),
      },
      headerRows: {
        default: 0,
        parseHTML: (el) => Number(el.getAttribute('data-header-rows') ?? 0),
        renderHTML: () => ({}),
      },
      description: {
        default: '',
        parseHTML: (el) => el.getAttribute('data-description') ?? '',
        renderHTML: () => ({}),
      },
      caption: {
        default: '',
        parseHTML: (el) => el.querySelector('caption')?.textContent ?? '',
        renderHTML: () => ({}),
      },
    };
  },

  parseHTML: () => [{ tag: 'table[data-chapter-table]' }],
  renderHTML: ({ node }) => {
    const rows = node.attrs.rows as string[][];
    return [
      'table',
      {
        'data-chapter-table': '',
        'data-rows': JSON.stringify(rows),
        'data-header-rows': node.attrs.headerRows,
        'data-description': node.attrs.description,
        title: 'Bảng đính kèm, TTS không đọc',
      },
      ['caption', node.attrs.caption ?? ''],
      [
        'tbody',
        ...rows.map((row, index) => [
          'tr',
          ...row.map((cell) => [index < node.attrs.headerRows ? 'th' : 'td', cell]),
        ]),
      ],
    ];
  },
  renderText: () => TABLE_TEXT,

  addNodeView() {
    return ReactNodeViewRenderer(TableNodeView, {
      // Ô nhập và nút trong bảng tự xử lý phím, chuột; nếu không trình soạn sẽ nuốt phím gõ trong ô
      stopEvent: ({ event }) =>
        event.target instanceof Element && !!event.target.closest('[data-table-control], [data-caption-control]'),
    });
  },
});

/** Chèn một bảng trống 2 x 2 tại con trỏ; nội dung được gõ thẳng vào ô. */
export const insertTable = (editor: Editor) =>
  editor
    .chain()
    .focus()
    .insertContent({ type: 'table', attrs: { rows: [['', ''], ['', '']], headerRows: 1, description: '', caption: '' } })
    .run();
