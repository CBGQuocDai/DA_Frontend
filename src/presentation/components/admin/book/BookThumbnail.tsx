import React from 'react';
import { BookOpen } from 'lucide-react';

interface BookThumbnailProps {
  title: string;
  coverImage?: string | null;
  className?: string;
  iconClassName?: string;
}

/** Small book cover with an icon placeholder, used in admin tables and headers. */
export const BookThumbnail: React.FC<BookThumbnailProps> = ({
  title,
  coverImage,
  className = 'w-10 h-14 rounded',
  iconClassName = 'w-5 h-5',
}) => (
  <div
    className={`bg-bg border border-border overflow-hidden flex-shrink-0 flex items-center justify-center ${className}`}
  >
    {coverImage ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={coverImage} alt={title} className="w-full h-full object-cover" />
    ) : (
      <BookOpen className={`text-text-muted ${iconClassName}`} />
    )}
  </div>
);
