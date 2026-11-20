'use client';

import React from 'react';
import { Eye, EyeOff, MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { FloatingMenu, type MenuAnchor } from '@/src/presentation/components/common';

interface BookRowActionsProps {
  /** Vị trí menu đang mở, null khi đóng; cả bảng chỉ có một menu mở */
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
 * Menu thao tác cho từng sách trong bảng quản lý sách, bấm để mở. Render qua portal
 * để vùng cuộn của bảng không cắt mất menu ở các dòng cuối.
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
