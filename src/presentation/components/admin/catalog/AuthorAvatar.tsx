'use client';

import React from 'react';
import { resolveMediaUrl } from '@/src/shared/utils';

interface AuthorAvatarProps {
  name?: string;
  url?: string | null;
  className?: string;
}

/** Tên người Việt đặt tên gọi ở cuối nên "Nguyễn Nhật Ánh" hiển thị chữ "Á". */
const initialOf = (name?: string) => name?.trim().split(/\s+/).pop()?.charAt(0).toUpperCase() || '?';

export const AuthorAvatar: React.FC<AuthorAvatarProps> = ({ name, url, className = 'h-9 w-9 text-sm' }) =>
  url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={resolveMediaUrl(url)}
      alt={name ?? 'Ảnh tác giả'}
      className={`flex-shrink-0 rounded-full object-cover bg-bg ${className}`}
    />
  ) : (
    <span
      aria-hidden="true"
      className={`flex flex-shrink-0 items-center justify-center rounded-full bg-accent-light font-semibold text-accent ${className}`}
    >
      {initialOf(name)}
    </span>
  );
