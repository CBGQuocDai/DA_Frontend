'use client';

import { useState } from 'react';

interface AuthorAvatarProps {
  author: { name: string; portrait?: string };
  variant?: 'card' | 'profile';
}

export const AuthorAvatar = ({ author, variant = 'card' }: AuthorAvatarProps) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const initials = author.name.split(/[\s-]+/).filter(Boolean).map((part) => part[0]);
  const monogram = initials.length > 1 ? `${initials[0]}${initials[initials.length - 1]}` : initials[0] ?? 'TG';
  const isProfile = variant === 'profile';

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden bg-accent-light font-bold text-accent ring-2 ring-slate-100 ring-offset-2 ${isProfile ? 'h-40 w-40 rounded-2xl text-4xl lg:h-44 lg:w-44' : 'h-24 w-24 rounded-full text-2xl'}`}>
      {author.portrait && author.portrait !== failedSrc ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={author.portrait}
          alt={`Chân dung ${author.name}`}
          width={isProfile ? 176 : 96}
          height={isProfile ? 176 : 96}
          loading={isProfile ? 'eager' : 'lazy'}
          onError={() => setFailedSrc(author.portrait ?? null)}
          className="h-full w-full object-cover object-[center_25%]"
        />
      ) : (
        <span aria-label={author.name}>{monogram}</span>
      )}
    </div>
  );
};
