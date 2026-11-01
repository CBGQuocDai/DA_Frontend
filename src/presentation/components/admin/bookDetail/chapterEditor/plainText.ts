import type { JSONContent } from '@tiptap/core';

/** Average Vietnamese TTS pace at 1.0x, in words (syllables) per minute. */
const WORDS_PER_MINUTE = 180;

/** Separator the backend OCR puts between PDF pages in `rawText`. */
const PAGE_BREAK = /-{3,}\s*page_break\s*-{3,}/gi;
const PAGE_BREAK_LINE = /^\s*-{3,}\s*page_break\s*-{3,}\s*$/i;
export const PAGE_BREAK_TEXT = '-------------page_break------------------';

export const countWords = (text?: string) => {
  if (!text) return 0;
  return text.replace(PAGE_BREAK, ' ').trim().split(/\s+/).filter(Boolean).length;
};

/** Estimated audio length in seconds for the given text and reading speed. */
export const estimateAudioSeconds = (text: string | undefined, speed = 1) =>
  Math.round((countWords(text) / (WORDS_PER_MINUTE * speed)) * 60);

/** One block per line (separator lines become page-break nodes), so the editor text round-trips. */
export const textToDoc = (text: string): JSONContent => ({
  type: 'doc',
  content: text.split('\n').map((line) => {
    if (PAGE_BREAK_LINE.test(line)) return { type: 'pageBreak' };
    return line ? { type: 'paragraph', content: [{ type: 'text', text: line }] } : { type: 'paragraph' };
  }),
});

/** Inverse of `textToDoc`: the text the editor reports for a document. */
const docToText = (doc: JSONContent) =>
  (doc.content ?? [])
    .map((node) =>
      node.type === 'pageBreak' ? PAGE_BREAK_TEXT : (node.content ?? []).map((child) => child.text ?? '').join('')
    )
    .join('\n');

/** The document to store next to `rawText`; empty when nothing is formatted, so plain chapters cost nothing. */
export const serializeDoc = (doc: JSONContent) => {
  const isFormatted = doc.content?.some((node) => {
    const align = node.attrs?.textAlign;
    return (align && align !== 'left') || node.content?.some((child) => child.marks?.length);
  });
  return isFormatted ? JSON.stringify(doc) : '';
};

/**
 * Stored formatting, if it still belongs to `rawText`. The backend keeps the two equal on every
 * save; this guards rows changed outside the API, so the editor never shows text TTS won't read.
 */
export const getValidContent = (contentJson: string | undefined, rawText: string) => {
  if (!contentJson) return '';
  try {
    return docToText(JSON.parse(contentJson)) === rawText ? contentJson : '';
  } catch {
    return '';
  }
};

export const loadDoc = (content: string, text: string): JSONContent =>
  content ? JSON.parse(content) : textToDoc(text);

/**
 * Rejoins lines a PDF broke mid-sentence. Conservative on purpose: only merges when the
 * line has no closing punctuation and the next one starts in lowercase, so headings stay put.
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
 * Cleans text pasted from PDFs/web before it is sent to TTS: composes Vietnamese
 * diacritics (NFC), unifies whitespace, drops spaces before punctuation and
 * collapses runs of blank lines.
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
