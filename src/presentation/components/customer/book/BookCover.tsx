'use client';

import React, { useState } from 'react';
import { Headphones } from 'lucide-react';

interface BookCoverProps {
  title: string;
  author?: string;
  coverImage?: string;
  className?: string;
}

/** Cover image, or a typographic placeholder when the book has none (or it fails to load). */
export const BookCover: React.FC<BookCoverProps> = ({ title, author, coverImage, className = '' }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  if (coverImage && failedSrc !== coverImage) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={coverImage}
        alt={title}
        loading="lazy"
        onError={() => setFailedSrc(coverImage)}
        className={`w-full h-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`w-full h-full bg-gradient-to-br from-slate-100 via-accent-light/40 to-slate-200 text-slate-800 p-3 flex flex-col justify-between select-none ${className}`}
    >
      <div className="text-center pt-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider truncate">
        {author || 'Sách nói'}
      </div>
      <div className="my-auto text-center px-1">
        <Headphones className="w-7 h-7 mx-auto mb-1.5 text-rose-500" />
        <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">{title}</div>
      </div>
      <div className="text-center pb-0.5 text-[8px] text-accent font-semibold uppercase tracking-wider">
        Audio Bản Quyền
      </div>
    </div>
  );
};
