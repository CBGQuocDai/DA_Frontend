'use client';

import React from 'react';
import { Eye, EyeOff, MessageSquare, MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface BookRowActionsProps {
  isPublished: boolean;
  isBusy: boolean;
  onViewReviews: () => void;
  onTogglePublish: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const itemClass =
  'w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer';

/** Hover dropdown with the per-book actions of the manage-books table. */
export const BookRowActions: React.FC<BookRowActionsProps> = ({
  isPublished,
  isBusy,
  onViewReviews,
  onTogglePublish,
  onEdit,
  onDelete,
}) => (
  <div className="relative group">
    <button
      type="button"
      className="h-8 w-8 inline-flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg border border-transparent hover:border-border rounded-lg transition-colors cursor-pointer"
      title="Thao tác khác"
    >
      <MoreVertical className="w-4 h-4" />
    </button>
    <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[170px] py-1 overflow-hidden text-left">
      <button type="button" onClick={onViewReviews} className={itemClass}>
        <MessageSquare className="w-4 h-4 text-accent" />
        <span>Xem bình luận</span>
      </button>
      <button type="button" onClick={onTogglePublish} disabled={isBusy} className={itemClass}>
        {isPublished ? (
          <EyeOff className="w-4 h-4 text-text-secondary" />
        ) : (
          <Eye className="w-4 h-4 text-text-secondary" />
        )}
        <span>{isPublished ? 'Gỡ xuất bản' : 'Đăng xuất bản'}</span>
      </button>
      <button type="button" onClick={onEdit} className={itemClass}>
        <Pencil className="w-4 h-4 text-text-secondary" />
        <span>Sửa sách</span>
      </button>
      <div className="border-t border-border my-1" />
      <button
        type="button"
        onClick={onDelete}
        disabled={isBusy}
        className={`${itemClass} text-error hover:bg-error-light`}
      >
        <Trash2 className="w-4 h-4 text-error" />
        <span>Xóa sách</span>
      </button>
    </div>
  </div>
);
