import type { Book } from '@/src/shared/types';
import type { BookFormValues } from './BookFormModal';
import { getBookAuthors, getBookCategories, getBookPrice } from '@/src/shared/utils';

export const getBookCategoryIds = (book?: Book): number[] =>
  getBookCategories(book).map((category) => category.id);

export const getBookAuthorIds = (book?: Book): number[] =>
  getBookAuthors(book).map((author) => author.id);

export const getBookPriceInput = (book?: Book): string => {
  const price = getBookPrice(book);
  return price == null ? '' : String(Math.round(price));
};

/** Multipart body expected by the create/update book endpoints. */
export const toBookFormData = (values: BookFormValues): FormData => {
  const form = new FormData();
  const book = {
    title: values.title,
    description: values.description,
    price: values.price,
    voice: { id: values.voiceId },
    categories: values.categoryIds.map((id) => ({ id })),
    authors: values.authorIds.map((id) => ({ id })),
  };
  form.append('book', new Blob([JSON.stringify(book)], { type: 'application/json' }));
  if (values.pdfFile) form.append('contentFile', values.pdfFile);
  if (values.coverFile) form.append('bookCover', values.coverFile);
  return form;
};
