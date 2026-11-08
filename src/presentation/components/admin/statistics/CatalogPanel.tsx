import React from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import type { BookStatus } from '@/src/shared/types';
import { bookStatusConfig } from '@/src/presentation/utils/admin';
import { ROUTES } from '@/src/shared/constants';
import { Panel } from './Panel';
import { formatCount } from './format';

/** Bar order and colour; labels come from the status badges so both read the same */
const PARTS: { key: BookStatus; color: string }[] = [
  { key: 'PUBLISHED', color: 'bg-success' },
  { key: 'UNPUBLISHED', color: 'bg-text-muted' },
  { key: 'PROCESSING', color: 'bg-warning' },
  { key: 'FAILED', color: 'bg-error' },
];

/** How many books customers can see, and how many are still in, or stuck in, processing. */
export const CatalogPanel: React.FC<{ bookStatus: Record<BookStatus, number> }> = ({ bookStatus }) => {
  const parts = PARTS.map((part) => ({
    ...part,
    label: bookStatusConfig[part.key].label,
    value: bookStatus[part.key] ?? 0,
  }));
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  return (
    <Panel
      title="Kho sách"
      description="Trạng thái xuất bản"
      action={
        <p className="text-sm text-text-muted">
          <span className="text-2xl font-semibold text-text-primary">{formatCount(total)}</span> cuốn
        </p>
      }
    >
      <div
        className="flex h-2 gap-0.5 rounded-full bg-border-light overflow-hidden"
        role="img"
        aria-label={parts.map((part) => `${part.label}: ${part.value}`).join(', ')}
      >
        {parts
          .filter((part) => part.value > 0)
          .map((part) => (
            <div key={part.key} className={`${part.color} h-full`} style={{ flexGrow: part.value }} />
          ))}
      </div>
      <ul className="mt-4 space-y-2">
        {parts.map((part) => (
          <li key={part.key} className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${part.color}`} aria-hidden="true" />
            <span className={part.value > 0 ? 'text-text-secondary' : 'text-text-muted'}>{part.label}</span>
            <span className={`ml-auto tabular-nums ${part.value > 0 ? 'text-text-primary font-medium' : 'text-text-muted'}`}>
              {formatCount(part.value)}
            </span>
          </li>
        ))}
      </ul>
      {bookStatus.FAILED > 0 && (
        <Link
          href={ROUTES.ADMIN.MANAGE_BOOK}
          className="mt-4 flex items-start gap-2 rounded-lg bg-error-light px-3 py-2.5 text-sm text-error hover:underline"
        >
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          {bookStatus.FAILED} sách xử lý lỗi, mở Quản lý sách để xem lại
        </Link>
      )}
    </Panel>
  );
};
