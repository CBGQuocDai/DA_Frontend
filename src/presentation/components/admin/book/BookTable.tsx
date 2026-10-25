'use client';

import React from 'react';
import { BookOpen, Mic, Star } from 'lucide-react';
import { Badge, EmptyState, Spinner } from '@/src/presentation/components/common';
import { getBookStatusBadge } from '@/src/presentation/utils/admin';
import type { Book } from '@/src/shared/types';
import { formatBookPrice, getBookAuthorNames, getBookCategories, isBookPublished } from '@/src/shared/utils';
import { BookRowActions } from './BookRowActions';
import { BookThumbnail } from './BookThumbnail';

const COLUMNS = [
  { label: 'STT', className: 'w-14 text-center px-3 font-mono' },
  { label: 'Tên sách', className: 'w-auto text-left px-4 min-w-[180px]' },
  { label: 'Giá', className: 'w-28 text-left px-4' },
  { label: 'Thể loại', className: 'w-60 text-left px-4' },
  { label: 'Tác giả', className: 'w-60 text-left px-4' },
  { label: 'Đánh giá', className: 'w-28 text-left px-4' },
  { label: 'Trạng thái', className: 'w-36 text-left px-4' },
  { label: 'Thao tác', className: 'w-20 text-center px-3' },
];
const MAX_VISIBLE_CATEGORIES = 2;

const Muted: React.FC = () => <span className="text-xs text-text-muted italic">—</span>;

export interface BookRowHandlers {
  onOpen: (book: Book) => void;
  onViewReviews: (book: Book) => void;
  onTogglePublish: (book: Book) => void;
  onEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
}

interface BookTableProps extends BookRowHandlers {
  books: Book[];
  isLoading: boolean;
  startIndex: number;
  busyBookId: number | null;
}

const BookRow: React.FC<BookRowHandlers & { book: Book; index: number; isBusy: boolean }> = ({
  book,
  index,
  isBusy,
  onOpen,
  onViewReviews,
  onTogglePublish,
  onEdit,
  onDelete,
}) => {
  const title = book.title || 'Chưa có tiêu đề';
  const categories = getBookCategories(book);
  const authorNames = getBookAuthorNames(book, '');
  const rating = book.averageRating ?? 0;

  return (
    <tr onClick={() => onOpen(book)} className="hover:bg-bg transition-colors cursor-pointer">
      <td className="px-3 py-3 text-center text-sm text-text-secondary font-mono">{index + 1}</td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <BookThumbnail title={title} coverImage={book.coverImage} />
          <div className="min-w-0">
            <p className="font-medium text-text-primary line-clamp-1" title={title}>
              {title}
            </p>
            {book.voice && (
              <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                <Mic className="w-3 h-3" />
                {book.voice.name}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm text-text-secondary whitespace-nowrap">{formatBookPrice(book)}</td>

      <td className="px-4 py-3">
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {categories.slice(0, MAX_VISIBLE_CATEGORIES).map((category) => (
              <Badge key={category.id} variant="primary" className="text-xs">
                {category.name}
              </Badge>
            ))}
            {categories.length > MAX_VISIBLE_CATEGORIES && (
              <span className="text-xs text-text-muted self-center">
                +{categories.length - MAX_VISIBLE_CATEGORIES}
              </span>
            )}
          </div>
        ) : (
          <Muted />
        )}
      </td>

      <td className="px-4 py-3">
        {authorNames ? (
          <span className="text-sm text-text-secondary line-clamp-1" title={authorNames}>
            {authorNames}
          </span>
        ) : (
          <Muted />
        )}
      </td>

      <td className="px-4 py-3">
        {rating > 0 ? (
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
            <span className="font-semibold text-text-primary text-sm">{rating.toFixed(1)}</span>
            <span className="text-xs text-text-muted">/ 5</span>
          </div>
        ) : (
          <span className="text-xs text-text-muted italic flex items-center gap-1 whitespace-nowrap">
            <Star className="w-3.5 h-3.5 opacity-40 flex-shrink-0" />
            Chưa có
          </span>
        )}
      </td>

      <td className="px-4 py-3 whitespace-nowrap">{getBookStatusBadge(book)}</td>

      <td className="px-3 py-3.5 text-center whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-center">
          <BookRowActions
            isPublished={isBookPublished(book)}
            isBusy={isBusy}
            onViewReviews={() => onViewReviews(book)}
            onTogglePublish={() => onTogglePublish(book)}
            onEdit={() => onEdit(book)}
            onDelete={() => onDelete(book)}
          />
        </div>
      </td>
    </tr>
  );
};

export const BookTable: React.FC<BookTableProps> = ({ books, isLoading, startIndex, busyBookId, ...handlers }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[880px] border-collapse">
      <thead>
        <tr className="border-b border-border bg-bg/80 text-text-secondary text-xs font-semibold uppercase tracking-wider">
          {COLUMNS.map((column) => (
            <th key={column.label} className={`py-3.5 whitespace-nowrap ${column.className}`}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {isLoading ? (
          <tr>
            <td colSpan={COLUMNS.length} className="px-4 py-16">
              <div className="flex items-center justify-center gap-2 text-text-secondary">
                <Spinner className="w-5 h-5" />
                Đang tải...
              </div>
            </td>
          </tr>
        ) : books.length === 0 ? (
          <tr>
            <td colSpan={COLUMNS.length} className="p-4">
              <EmptyState
                icon={<BookOpen className="w-12 h-12" strokeWidth={1.5} />}
                title="Chưa có sách nào phù hợp"
                description="Thử thay đổi bộ lọc hoặc thêm sách mới"
                className="border-none bg-transparent"
              />
            </td>
          </tr>
        ) : (
          books.map((book, index) => (
            <BookRow
              key={book.id}
              book={book}
              index={startIndex + index}
              isBusy={busyBookId === book.id}
              {...handlers}
            />
          ))
        )}
      </tbody>
    </table>
  </div>
);
