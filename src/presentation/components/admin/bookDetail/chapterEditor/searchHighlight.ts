import { Extension, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey, TextSelection } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

interface Range {
  from: number;
  to: number;
}

export interface SearchState {
  query: string;
  caseSensitive: boolean;
  matches: Range[];
  current: number;
  decorations: DecorationSet;
}

type SearchMeta = Partial<Pick<SearchState, 'query' | 'caseSensitive' | 'current'>>;

export const searchKey = new PluginKey<SearchState>('chapterSearch');

// Paragraphs hold only text nodes, so textContent offsets map 1:1 to doc positions
const findMatches = (doc: PMNode, query: string, caseSensitive: boolean): Range[] => {
  if (!query) return [];
  const needle = caseSensitive ? query : query.toLowerCase();
  const matches: Range[] = [];
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    const text = caseSensitive ? node.textContent : node.textContent.toLowerCase();
    for (let i = text.indexOf(needle); i !== -1; i = text.indexOf(needle, i + needle.length)) {
      matches.push({ from: pos + 1 + i, to: pos + 1 + i + needle.length });
    }
    return false;
  });
  return matches;
};

const buildState = (doc: PMNode, query: string, caseSensitive: boolean, current: number): SearchState => {
  const matches = findMatches(doc, query, caseSensitive);
  const index = matches.length ? Math.min(Math.max(current, 0), matches.length - 1) : 0;
  const decorations = DecorationSet.create(
    doc,
    matches.map((m, i) =>
      Decoration.inline(m.from, m.to, {
        class: i === index ? 'search-match search-match-current' : 'search-match',
      })
    )
  );
  return { query, caseSensitive, matches, current: index, decorations };
};

/** Highlights find-panel matches; driven by the helpers below rather than editor commands. */
export const SearchHighlight = Extension.create({
  name: 'searchHighlight',

  addProseMirrorPlugins() {
    return [
      new Plugin<SearchState>({
        key: searchKey,
        state: {
          init: (_, { doc }) => buildState(doc, '', false, 0),
          apply: (tr, prev) => {
            const meta = tr.getMeta(searchKey) as SearchMeta | undefined;
            if (!meta && !tr.docChanged) return prev;
            return buildState(
              tr.doc,
              meta?.query ?? prev.query,
              meta?.caseSensitive ?? prev.caseSensitive,
              meta?.current ?? prev.current
            );
          },
        },
        props: {
          decorations: (state) => searchKey.getState(state)?.decorations,
        },
      }),
    ];
  },
});

export const getSearchState = (editor: Editor) => searchKey.getState(editor.state);

export const setSearch = (editor: Editor, query: string, caseSensitive: boolean) => {
  editor.view.dispatch(editor.state.tr.setMeta(searchKey, { query, caseSensitive, current: 0 }));
};

/** Moves to the next (+1) or previous (-1) match, wrapping around, and scrolls it into view. */
export const gotoMatch = (editor: Editor, delta: number) => {
  const state = getSearchState(editor);
  if (!state?.matches.length) return;
  const current = (state.current + delta + state.matches.length) % state.matches.length;
  const match = state.matches[current];
  const tr = editor.state.tr
    .setMeta(searchKey, { current })
    .setSelection(TextSelection.create(editor.state.doc, match.from, match.to))
    .scrollIntoView();
  editor.view.dispatch(tr);
};

export const replaceCurrent = (editor: Editor, replacement: string) => {
  const state = getSearchState(editor);
  const match = state?.matches[state.current];
  if (!match) return;
  const tr = replacement
    ? editor.state.tr.insertText(replacement, match.from, match.to)
    : editor.state.tr.delete(match.from, match.to);
  editor.view.dispatch(tr.scrollIntoView());
};

/** Replaces every match in a single transaction, so one undo reverts it. Returns the count. */
export const replaceAll = (editor: Editor, replacement: string) => {
  const matches = getSearchState(editor)?.matches ?? [];
  if (!matches.length) return 0;
  const tr = editor.state.tr;
  [...matches].reverse().forEach(({ from, to }) => {
    if (replacement) tr.insertText(replacement, from, to);
    else tr.delete(from, to);
  });
  editor.view.dispatch(tr);
  return matches.length;
};
