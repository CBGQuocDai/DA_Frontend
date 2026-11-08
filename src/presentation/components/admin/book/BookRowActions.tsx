'use client';

import React from 'react';
import { Eye, EyeOff, MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { FloatingMenu, type MenuAnchor } from '@/src/presentation/components/common';

interface BookRowActionsProps {
  /** Where the menu is open, or null when closed; the table keeps a single open menu */
  anchor: MenuAnchor | null;
  onToggle: (trigger: HTMLElement) => void;
  onClose: () => void;
  isPublished: boolean;
  isBusy: boolean;
  onViewReviews: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const itemClass =
  'w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer';

/**
 * Click-to-open menu with the per-book actions of the manage-books table. Rendered in a
 * portal so the table's scroll container cannot clip it on the last rows.
 */
export const BookRowActions: React.FC<BookRowActionsProps> = ({
  anchor,
  onToggle,
  onClose,
  isPublished,
  isBusy,
  onViewReviews,
  onTogglePublish,
  onEdit,
  onDelete,
}) => {
  const run = (action: () => void) => () => {
    onClose();
    action();
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle(e.currentTarget);
        }}
        aria-haspopup="menu"
        aria-expanded={Boolean(anchor)}
        aria-label="Thao tác khác"
        className={`h-8 w-8 inline-flex items-center justify-center rounded-lg border transition-colors cursor-pointer ${
          anchor
            ? 'text-text-primary bg-bg border-border'
            : 'text-text-muted border-transparent hover:text-text-primary hover:bg-bg hover:border-border'
        }`}
      >
        <MoreVertical className="w-4 h-4" />
      </button>
      {anchor && (
        <FloatingMenu anchor={anchor} onClose={onClose}>
          <div role="menu" className="min-w-[170px] text-left">
            <button type="button" role="menuitem" onClick={run(onViewReviews)} className={itemClass}>
              <MessageSquare className="w-4 h-4 text-accent" />
              <span>Xem bình luận</span>
            </button>
            <button type="button" role="menuitem" onClick={run(onTogglePublish)} disabled={isBusy} className={itemClass}>
              {isPublished ? (
                <EyeOff className="w-4 h-4 text-text-secondary" />
              ) : (
                <Eye className="w-4 h-4 text-text-secondary" />
              )}
              <span>{isPublished ? 'Gỡ xuất bản' : 'Đăng xuất bản'}</span>
            </button>
            <button type="button" role="menuitem" onClick={run(onEdit)} className={itemClass}>
              <Pencil className="w-4 h-4 text-text-secondary" />
              <span>Sửa sách</span>
            </button>
            <div className="border-t border-border my-1" />
            <button
              type="button"
              role="menuitem"
              onClick={run(onDelete)}
              disabled={isBusy}
              className={`${itemClass} text-error hover:bg-error-light`}
            >
              <Trash2 className="w-4 h-4 text-error" />
              <span>Xóa sách</span>
            </button>
          </div>
        </FloatingMenu>
      )}
    </>
  );
};
