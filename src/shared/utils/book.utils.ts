import type { Author, Book, BookAuthor, BookCategory, BookStatus, Category } from '@/src/shared/types';
import { formatVnd } from './format.utils';

// The API returns either plain items (`categories`/`authors`) or join rows (`bookCategories`/`bookAuthors`)
const unwrap = <T extends { id: number }, K extends string>(
  items: (T | ({ id: number } & Record<K, T>))[] | null | undefined,
  key: K,
): T[] =>
  (items ?? []).map((item) => (key in item ? (item as Record<K, T>)[key] : (item as T)));

export const getBookCategories = (book?: Book | null): Category[] =>
  unwrap<Category, 'category'>(
    (book?.categories ?? book?.bookCategories) as (Category | BookCategory)[] | undefined,
    'category',
  );

export const getBookAuthors = (book?: Book | null): Author[] =>
  unwrap<Author, 'author'>(
    (book?.authors ?? book?.bookAuthors) as (Author | BookAuthor)[] | undefined,
    'author',
  );

export const getBookAuthorNames = (book?: Book | null, fallback = 'Nhiều tác giả'): string => {
  const names = getBookAuthors(book)
    .map((author) => author.fullName)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : fallback;
};

// Price is a number in list responses but `{ source, parsedValue }` in the detail response
export const getBookPrice = (book?: Book | null): number | null => {
  const price = book?.price as number | { parsedValue: number } | null | undefined;
  if (price == null) return null;
  const value = typeof price === 'object' ? price.parsedValue : Number(price);
  return Number.isFinite(value) ? value : null;
};

export const formatBookPrice = (book?: Book | null): string => {
  const price = getBookPrice(book);
  return price ? formatVnd(price) : 'Miễn phí';
};

// Older responses only carry the `isPublish` flag instead of `status`
export const getBookStatus = (book: Book): BookStatus =>
  book.status || (book.isPublish ? 'PUBLISHED' : 'PROCESSING');

export const isBookPublished = (book: Book): boolean => getBookStatus(book) === 'PUBLISHED';
