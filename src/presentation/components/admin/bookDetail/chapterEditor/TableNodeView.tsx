'use client';

import React, { useState } from 'react';
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { NodeSelection, Selection } from '@tiptap/pm/state';
import { ArrowDown, ArrowUp, Plus, Trash2, X } from 'lucide-react';
import { CaptionInput } from './CaptionInput';

const MAX_COLUMNS = 8;

/** Mọi hàng có cùng số cột để lưới ô nhập không bị lệch khi OCR trả về hàng thiếu ô. */
const toGrid = (rows: string[][]) => {
  const width = Math.max(1, ...rows.map((row) => row.length));
  const grid = rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? ''));
  return grid.length ? grid : [Array.from({ length: width }, () => '')];
};

const controlButton =
  'inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-text-secondary hover:bg-bg hover:text-text-primary disabled:pointer-events-none disabled:opacity-30';
const removeButton =
  'rounded p-0.5 text-text-muted opacity-0 transition-opacity hover:bg-error-light hover:text-error focus-visible:opacity-100 group-hover/table:opacity-100 group-focus-within/table:opacity-100 disabled:pointer-events-none disabled:!opacity-0';

interface CellProps {
  value: string;
  isHeader: boolean;
  label: string;
  onChange: (value: string) => void;
}

/**
 * Một ô sửa được. Giữ bản nháp riêng để con trỏ không nhảy khi tài liệu cập nhật sau mỗi phím gõ,
 * và nhận lại giá trị từ tài liệu khi nó đổi từ bên ngoài (hoàn tác, thêm bớt hàng cột).
 */
const Cell: React.FC<CellProps> = ({ value, isHeader, label, onChange }) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }

  return (
    // Bản sao ẩn nằm chung ô lưới với textarea để ô tự cao theo nội dung
    <div className="grid">
      <div aria-hidden className="invisible col-start-1 row-start-1 whitespace-pre-wrap break-words px-2 py-1">
        {draft + ' '}
      </div>
      <textarea
        value={draft}
        rows={1}
        aria-label={label}
        spellCheck={false}
        onChange={(e) => {
          // Ô bảng là một dòng chữ; xuống dòng dán vào được đổi thành khoảng trắng
          const next = e.target.value.replace(/\n/g, ' ');
          setDraft(next);
          onChange(next);
        }}
        className={`col-start-1 row-start-1 w-full resize-none overflow-hidden bg-transparent px-2 py-1 text-text-primary outline-none focus:bg-accent-light/40 ${
          isHeader ? 'font-semibold' : ''
        }`}
      />
    </div>
  );
};

/**
 * Bảng đính kèm sửa ngay trong trình soạn: gõ thẳng vào ô, sửa chú thích, thêm bớt hàng cột, đổi chỗ hoặc xóa bảng.
 * Mọi thay đổi ghi vào thuộc tính của node nên đi cùng bản nháp của chương và hoàn tác được;
 * chỉ khi lưu chương mới gọi API.
 */
export const TableNodeView: React.FC<NodeViewProps> = ({ node, editor, getPos, updateAttributes, deleteNode }) => {
  const rows = toGrid(node.attrs.rows as string[][]);
  const headerRows = Math.min(node.attrs.headerRows as number, rows.length);
  const columnCount = rows[0].length;

  const setRows = (next: string[][], nextHeaderRows = headerRows) =>
    updateAttributes({ rows: next, headerRows: Math.min(nextHeaderRows, next.length) });

  /** Đổi chỗ bảng với khối liền trước hoặc liền sau. */
  const move = (direction: -1 | 1) =>
    editor.commands.command(({ tr }) => {
      const pos = getPos();
      if (pos === undefined) return false;
      const $pos = tr.doc.resolve(pos);
      const index = $pos.index();
      const sibling = $pos.parent.maybeChild(index + direction);
      const table = $pos.parent.maybeChild(index);
      if (!sibling || !table) return false;
      tr.delete(pos, pos + table.nodeSize);
      tr.insert(direction < 0 ? pos - sibling.nodeSize : pos + sibling.nodeSize, table);
      return true;
    });

  /**
   * Bảng vừa chèn hoặc vừa bấm vào viền đang được chọn cả khối. Nếu để nguyên trong lúc sửa ô thì khi
   * quay lại đoạn văn, trình soạn khôi phục vùng chọn đó và phím gõ tiếp theo sẽ đè mất cả bảng.
   * Vì vậy khi vào ô, vùng chọn được dời sang đoạn văn gần nhất.
   */
  const releaseNodeSelection = () => {
    const { state, view } = editor;
    const pos = getPos();
    if (pos === undefined || !(state.selection instanceof NodeSelection) || state.selection.from !== pos) return;
    const next =
      Selection.findFrom(state.doc.resolve(pos + node.nodeSize), 1, true) ??
      Selection.findFrom(state.doc.resolve(pos), -1, true);
    if (next) view.dispatch(state.tr.setSelection(next).setMeta('addToHistory', false));
  };

  return (
    <NodeViewWrapper data-chapter-table-view="" className="group/table" title="Bảng đính kèm, TTS không đọc">
      {/* Mọi thứ trong vùng này tự xử lý phím và chuột; trình soạn chỉ nhận thao tác ở viền ngoài */}
      <div data-table-control="" contentEditable={false} onFocusCapture={releaseNodeSelection}>
        <div className="flex flex-wrap items-center gap-1 border-b border-border px-1 py-0.5">
          <button type="button" className={controlButton} onClick={() => setRows([...rows, rows[0].map(() => '')])}>
            <Plus className="h-3 w-3" /> Hàng
          </button>
          <button
            type="button"
            className={controlButton}
            disabled={columnCount >= MAX_COLUMNS}
            onClick={() => setRows(rows.map((row) => [...row, '']))}
          >
            <Plus className="h-3 w-3" /> Cột
          </button>
          <label className={`${controlButton} cursor-pointer`}>
            <input
              type="checkbox"
              checked={headerRows > 0}
              onChange={(e) => setRows(rows, e.target.checked ? 1 : 0)}
              className="h-3 w-3"
            />
            Hàng đầu là tiêu đề
          </label>
          <span className="ml-auto flex items-center gap-0.5">
            <button type="button" className={controlButton} onClick={() => move(-1)} title="Chuyển bảng lên trên" aria-label="Chuyển bảng lên trên">
              <ArrowUp className="h-3 w-3" />
            </button>
            <button type="button" className={controlButton} onClick={() => move(1)} title="Chuyển bảng xuống dưới" aria-label="Chuyển bảng xuống dưới">
              <ArrowDown className="h-3 w-3" />
            </button>
            <button
              type="button"
              className={`${controlButton} hover:!bg-error-light hover:!text-error`}
              onClick={deleteNode}
              title="Xóa bảng"
              aria-label="Xóa bảng"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        </div>

        <div data-caption-control="">
          <CaptionInput
            value={node.attrs.caption ?? ''}
            placeholder="Thêm chú thích bảng (vd: Bảng 2.1: So sánh các phương pháp)"
            label="Chú thích bảng"
            onChange={(caption) => updateAttributes({ caption })}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm leading-normal">
            <thead>
              <tr>
                {rows[0].map((_, columnIndex) => (
                  <td key={columnIndex} className="h-5 text-center align-middle">
                    <button
                      type="button"
                      className={removeButton}
                      disabled={columnCount <= 1}
                      onClick={() => setRows(rows.map((row) => row.filter((_, c) => c !== columnIndex)))}
                      title={`Xóa cột ${columnIndex + 1}`}
                      aria-label={`Xóa cột ${columnIndex + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </td>
                ))}
                <td className="w-6" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, columnIndex) => (
                    <td
                      key={columnIndex}
                      className={`min-w-[7rem] border border-border p-0 align-top ${rowIndex < headerRows ? 'bg-bg' : ''}`}
                    >
                      <Cell
                        value={cell}
                        isHeader={rowIndex < headerRows}
                        label={`Hàng ${rowIndex + 1}, cột ${columnIndex + 1}`}
                        onChange={(value) =>
                          setRows(rows.map((r, ri) => (ri === rowIndex ? r.map((c, ci) => (ci === columnIndex ? value : c)) : r)))
                        }
                      />
                    </td>
                  ))}
                  <td className="w-6 text-center align-middle">
                    <button
                      type="button"
                      className={removeButton}
                      disabled={rows.length <= 1}
                      onClick={() =>
                        setRows(rows.filter((_, r) => r !== rowIndex), rowIndex < headerRows ? headerRows - 1 : headerRows)
                      }
                      title={`Xóa hàng ${rowIndex + 1}`}
                      aria-label={`Xóa hàng ${rowIndex + 1}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
