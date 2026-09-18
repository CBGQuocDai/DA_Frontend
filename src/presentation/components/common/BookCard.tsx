import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Book } from '@/src/shared/types';
import { formatDuration, formatPrice } from '@/src/shared/utils';
import { Card, Badge, StarRating } from '../ui';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact' | 'horizontal';
  showActions?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  variant = 'default',
  showActions = false,
}) => {
  if (variant === 'horizontal') {
    return (
      <Card hover className="flex gap-4 p-4">
        <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={book.coverImage || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 truncate">{book.title}</h3>
          <p className="text-sm text-slate-500">{book.author}</p>
          <div className="mt-1">
            <StarRating rating={book.rating} size="sm" showValue />
          </div>
          <div className="mt-2 flex items-center gap-2">
            <Badge variant="info">{book.category.name}</Badge>
            <span className="text-xs text-slate-400">{formatDuration(book.duration)}</span>
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          <p className="font-bold text-indigo-600">{formatPrice(book.price)}</p>
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Link href={`/customer/books/${book.id}`}>
        <Card hover className="p-3">
          <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
            <Image
              src={book.coverImage || '/placeholder-book.jpg'}
              alt={book.title}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="font-medium text-sm text-slate-900 truncate">{book.title}</h3>
          <p className="text-xs text-slate-500 truncate">{book.author}</p>
          <div className="mt-2 flex items-center justify-between">
            <StarRating rating={book.rating} size="sm" />
            <span className="text-xs font-semibold text-indigo-600">
              {formatPrice(book.price)}
            </span>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/customer/books/${book.id}`}>
      <Card hover className="h-full">
        <div className="relative h-48 rounded-t-xl overflow-hidden">
          <Image
            src={book.coverImage || '/placeholder-book.jpg'}
            alt={book.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute top-3 left-3">
            <Badge variant="info">{book.category.name}</Badge>
          </div>
          {book.status === 'DRAFT' && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="warning">Bản nháp</Badge>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 line-clamp-2 min-h-[3rem]">
            {book.title}
          </h3>
          <p className="text-sm text-slate-500 mt-1">{book.author}</p>
          <p className="text-xs text-slate-400 mt-0.5">Đọc: {book.narrator}</p>
          <div className="mt-3 flex items-center gap-2">
            <StarRating rating={book.rating} size="sm" showValue />
            <span className="text-xs text-slate-400">
              ({book.totalListens.toLocaleString()} lượt nghe)
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">{formatDuration(book.duration)}</span>
            <span className="font-bold text-indigo-600">{formatPrice(book.price)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default BookCard;
