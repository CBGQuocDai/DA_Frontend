'use client';

import { useState } from 'react';
import type { User } from '@/src/shared/types';
import { resolveMediaUrl } from '@/src/shared/utils';

interface CustomerAvatarProps {
  user: User;
  className?: string;
}

const AvatarImage = ({ src, name, initial }: { src: string; name: string; initial: string }) => {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <span aria-hidden="true">{initial}</span>;

  return (
    // URL ảnh có chữ ký được backend cấp; không qua Next Image optimizer/cache.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} onError={() => setFailed(true)} className="w-full h-full object-cover" />
  );
};

export const CustomerAvatar = ({ user, className = '' }: CustomerAvatarProps) => {
  const src = resolveMediaUrl(user.avatar);
  const name = user.fullName || user.email || 'Người dùng';

  return (
    <span className={`inline-flex items-center justify-center overflow-hidden bg-gradient-to-tr from-accent to-rose-500 text-white font-bold select-none ${className}`}>
      <AvatarImage key={`${user.id}:${src}`} src={src} name={name} initial={name.trim().charAt(0).toUpperCase() || 'U'} />
    </span>
  );
};
