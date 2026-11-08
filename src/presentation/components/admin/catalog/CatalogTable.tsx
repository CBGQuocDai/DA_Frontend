'use client';

import React from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button, EmptyState } from '@/src/presentation/components/common';

const SKELETON_ROWS = 5;

export interface CatalogColumn<T> {
  header: string;
  /** Applied to both the header and the cells, e.g. a width */
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface CatalogTableProps<T extends { id: number }> {
  items: T[];
  columns: CatalogColumn<T>[];
  /** Row number of the first item, for the "#" column */
  startIndex: number;
  isLoading: boolean;
  isFiltered: boolean;
  /** Name read out by the row action buttons, e.g. the author's name */
  itemLabel: (item: T) => string;
  empty: { icon: React.ReactNode; title: string; description: string; createLabel: string };
  filteredEmptyTitle: string;
  onCreate: () => void;
  onClearSearch: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

const iconButtonClass =
  'p-1.5 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40';

/** Table shared by the author and category screens: numbered rows, edit and delete at the end. */
export function CatalogTable<T extends { id: number }>({
  items,
  columns,
  startIndex,
  isLoading,
  isFiltered,
  itemLabel,
  empty,
  filteredEmptyTitle,
  onCreate,
  onClearSearch,
  onEdit,
  onDelete,
}: CatalogTableProps<T>) {
  const columnCount = columns.length + 2;

  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }, (_, row) => (
        <tr key={row}>
          <td className="px-4 py-4">
            <div className="h-4 w-6 bg-bg rounded animate-pulse mx-auto" />
          </td>
          {columns.map((column) => (
            <td key={column.header} className={`px-4 py-4 ${column.className ?? ''}`}>
              <div className="h-4 w-3/4 bg-bg rounded animate-pulse" />
            </td>
          ))}
          <td className="px-4 py-4">
            <div className="h-7 w-16 bg-bg rounded-lg animate-pulse ml-auto" />
          </td>
        </tr>
      ));
    }

    if (items.length === 0) {
      return (
        <tr>
          <td colSpan={columnCount} className="px-4 py-24">
            {isFiltered ? (
              <EmptyState
                title={filteredEmptyTitle}
                description="Thử một từ khóa khác hoặc xóa bộ lọc"
                action={
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="text-xs text-accent hover:underline font-medium cursor-pointer"
                  >
                    Xóa bộ lọc
                  </button>
                }
                className="border-none bg-transparent"
              />
            ) : (
              <EmptyState
                icon={
                  <span className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    {empty.icon}
                  </span>
                }
                title={empty.title}
                description={empty.description}
                action={
                  <Button onClick={onCreate} size="sm" className="h-9 px-4 rounded-lg">
                    <Plus className="w-3.5 h-3.5" />
                    <span>{empty.createLabel}</span>
                  </Button>
                }
                className="border-none bg-transparent"
              />
            )}
          </td>
        </tr>
      );
    }

    return items.map((item, index) => (
      <tr key={item.id} className="hover:bg-accent-light/30 transition-colors">
        <td className="px-4 py-3.5 text-center text-xs text-text-muted tabular-nums align-middle">
          {startIndex + index + 1}
        </td>
        {columns.map((column) => (
          <td key={column.header} className={`px-4 py-3.5 align-middle ${column.className ?? ''}`}>
            {column.render(item)}
          </td>
        ))}
        <td className="px-4 py-3.5 align-middle pr-5">
          <div className="flex justify-end gap-1">
            <button
              type="button"
              onClick={() => onEdit(item)}
              aria-label={`Sửa ${itemLabel(item)}`}
              title="Sửa"
              className={`${iconButtonClass} text-text-muted hover:text-text-primary hover:bg-bg`}
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(item)}
              aria-label={`Xóa ${itemLabel(item)}`}
              title="Xóa"
              className={`${iconButtonClass} text-text-muted hover:text-error hover:bg-error-light/50`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <table className="w-full min-w-[640px] border-collapse">
      <thead className="sticky top-0 bg-bg/95 backdrop-blur-sm z-10 border-b border-border">
        <tr className="text-text-secondary text-xs font-semibold">
          <th className="text-center px-4 py-3.5 w-14">#</th>
          {columns.map((column) => (
            <th key={column.header} className={`text-left px-4 py-3.5 ${column.className ?? ''}`}>
              {column.header}
            </th>
          ))}
          <th className="text-right px-4 py-3.5 w-28 pr-5 whitespace-nowrap">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-light">{renderBody()}</tbody>
    </table>
  );
}
