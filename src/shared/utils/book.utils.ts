import type { Author, Book, Category } from '@/src/shared/types';
import { formatVnd } from './format.utils';

// Backend trả thể loại/tác giả của sách dưới dạng dòng liên kết `{ id, category }` / `{ id, author }`
export const getBookCategories = (book?: Book | null): Category[] =>
  (book?.categories ?? []).map((item) => item.category);

export const getBookAuthors = (book?: Book | null): Author[] =>
  (book?.authors ?? []).map((item) => item.author);

export const getBookAuthorNames = (book?: Book | null, fallback = 'Nhiều tác giả'): string => {
  const names = getBookAuthors(book)
    .map((author) => author.fullName)
    .filter(Boolean);
  return names.length > 0 ? names.join(', ') : fallback;
};

// Giá là số ở response danh sách nhưng có dạng `{ source, parsedValue }` ở response chi tiết
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

export const isBookPublished = (book: Book): boolean => book.status === 'PUBLISHED';
