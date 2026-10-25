import type {
  Book,
  BookAuthor,
  BookCategory,
  Author,
  Category,
} from '@/src/shared/types';

// The API returns either plain items (`categories`/`authors`) or join rows (`bookCategories`/`bookAuthors`)
const toIds = <T extends { id: number }, K extends string>(
  items: (T | ({ id: number } & Record<K, T>))[] | null | undefined,
  key: K,
): number[] =>
  (items ?? []).map((item) =>
    key in item ? (item as Record<K, T>)[key].id : item.id,
  );

export const getBookCategoryIds = (book?: Book): number[] =>
  toIds<Category, 'category'>(
    (book?.categories ?? book?.bookCategories) as
      (Category | BookCategory)[] | undefined,
    'category',
  );

export const getBookAuthorIds = (book?: Book): number[] =>
  toIds<Author, 'author'>(
    (book?.authors ?? book?.bookAuthors) as (Author | BookAuthor)[] | undefined,
    'author',
  );

// Price is a number in list responses but `{ source, parsedValue }` in the detail response
export const getBookPriceInput = (book?: Book): string => {
  const price = book?.price as
    number | { parsedValue: number } | null | undefined;
  if (price == null) return '';
  const value = typeof price === 'object' ? price.parsedValue : Number(price);
  return Number.isFinite(value) ? String(Math.round(value)) : '';
};
