import type { JSONContent } from '@tiptap/core';

/** Tốc độ đọc trung bình của TTS tiếng Việt ở 1.0x, tính bằng từ (âm tiết) mỗi phút. */
const WORDS_PER_MINUTE = 180;

/** Dòng đại diện cho dấu ngắt trang trong văn bản của editor (dán vào hay khi dọn văn bản). */
const PAGE_BREAK = /-{3,}\s*page_break\s*-{3,}/gi;
const PAGE_BREAK_LINE = /^\s*-{3,}\s*page_break\s*-{3,}\s*$/i;
export const PAGE_BREAK_TEXT = '-------------page_break------------------';
/** Câu TTS đọc thay cho ảnh và bảng đính kèm; phải giống hệt phía backend (`ChapterDocument`). */
export const IMAGE_TEXT = 'Xem ảnh trong tệp đính kèm của chương.';
export const TABLE_TEXT = 'Xem bảng trong tệp đính kèm của chương.';
const ATTACHMENT_TEXT: Record<string, string> = { image: IMAGE_TEXT, table: TABLE_TEXT };

export const countWords = (text?: string) => {
  if (!text) return 0;
  return text.replace(PAGE_BREAK, ' ').trim().split(/\s+/).filter(Boolean).length;
};

/** Thời lượng audio ước tính (giây) theo văn bản và tốc độ đọc. */
export const estimateAudioSeconds = (text: string | undefined, speed = 1) =>
  Math.round((countWords(text) / (WORDS_PER_MINUTE * speed)) * 60);

/**
 * Mỗi dòng một block (dòng phân cách thành node ngắt trang) để văn bản qua editor rồi lấy ra vẫn y nguyên.
 * Ảnh và bảng của `source` được đặt lại vào đúng dòng đang đứng thay cho chúng, theo thứ tự.
 */
export const textToDoc = (text: string, source?: JSONContent): JSONContent => {
  const attachments = (source?.content ?? []).filter((node) => node.type && node.type in ATTACHMENT_TEXT);
  return {
    type: 'doc',
    content: text.split('\n').map((line) => {
      if (PAGE_BREAK_LINE.test(line)) return { type: 'pageBreak' };
      const index = attachments.findIndex((node) => ATTACHMENT_TEXT[node.type!] === line);
      if (index >= 0) return attachments.splice(index, 1)[0];
      return line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' };
    }),
  };
};

/** Văn bản TTS sẽ đọc từ một tài liệu đã lưu, giống `ChapterContentService.text` phía backend. */
export const docText = (content?: string | null) => {
  if (!content) return '';
  try {
    return ((JSON.parse(content) as JSONContent).content ?? [])
      .filter((node) => node.type !== 'pageBreak')
      .map((node) => ATTACHMENT_TEXT[node.type ?? ''] ?? (node.content ?? []).map((child) => child.text ?? '').join(''))
      .join('\n');
  } catch {
    return '';
  }
};

/** Có căn lề hoặc chữ đậm, nghiêng, gạch chân hay không. */
export const hasFormatting = (doc: JSONContent) =>
  !!doc.content?.some((node) => {
    const align = node.attrs?.textAlign;
    return (align && align !== 'left') || node.content?.some((child) => child.marks?.length);
  });

/** Tài liệu có ảnh hoặc bảng hay không, để biết có hiện nút xem tệp đính kèm. */
export const hasAttachments = (content?: string | null) => {
  if (!content) return false;
  try {
    return ((JSON.parse(content) as JSONContent).content ?? []).some((node) => node.type && node.type in ATTACHMENT_TEXT);
  } catch {
    return false;
  }
};

const EMPTY_DOC: JSONContent = { type: 'doc', content: [{ type: 'paragraph' }] };

/** Tài liệu để nạp vào editor; chương chưa có nội dung (hoặc tài liệu hỏng) mở thành trang trống. */
export const loadDoc = (content: string): JSONContent => {
  if (!content) return EMPTY_DOC;
  try {
    return JSON.parse(content) as JSONContent;
  } catch {
    return EMPTY_DOC;
  }
};

/**
 * Nối lại các dòng bị PDF ngắt giữa câu. Cố ý thận trọng: chỉ nối khi dòng không kết thúc bằng
 * dấu câu và dòng sau bắt đầu bằng chữ thường, nên tiêu đề vẫn nằm riêng.
 */
export const joinBrokenLines = (text: string) =>
  text.split('\n').reduce<string[]>((lines, line) => {
    const prev = lines[lines.length - 1]?.trimEnd();
    const isBroken =
      !!prev &&
      !PAGE_BREAK_LINE.test(prev) &&
      !/[.!?…:;”"')\]]$/.test(prev) &&
      /^\s*\p{Ll}/u.test(line);
    if (isBroken) lines[lines.length - 1] = `${prev} ${line.trimStart()}`;
    else lines.push(line);
    return lines;
  }, []).join('\n');

export const removeBlankLines = (text: string) =>
  text
    .split('\n')
    .filter((line) => line.trim())
    .join('\n');

/**
 * Làm sạch văn bản dán từ PDF/web trước khi gửi cho TTS: ghép dấu tiếng Việt (NFC),
 * thống nhất khoảng trắng, bỏ khoảng trắng trước dấu câu và gộp các dòng trống liên tiếp.
 */
export const normalizeText = (text: string) =>
  text
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/[\t  -​　]/g, ' ')
    .split('\n')
    .map((line) =>
      line
        .replace(/ {2,}/g, ' ')
        .replace(/ +([,.;:!?…)\]])/g, '$1')
        .replace(/([(\[]) +/g, '$1')
        .trim()
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
