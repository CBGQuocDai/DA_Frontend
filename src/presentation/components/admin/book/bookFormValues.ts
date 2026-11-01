import type { Book } from '@/src/shared/types';
import { uploadService, type BookPayload } from '@/src/infrastructure/api/services';
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

/**
 * Uploads the chosen PDF/cover straight to cloud storage, then builds the JSON
 * body of the create/update book endpoints. A file left empty on update resends
 * the current path of `book`, which keeps it.
 */
export const toBookPayload = async (values: BookFormValues, book?: Book): Promise<BookPayload> => {
  const [contentFile, coverImage] = await Promise.all([
    values.pdfFile ? uploadService.uploadFile(values.pdfFile, 'PDF') : book?.contentFile?.path,
    values.coverFile ? uploadService.uploadFile(values.coverFile, 'IMAGE') : book?.coverImage?.path,
  ]);
  return {
    title: values.title,
    description: values.description,
    price: values.price,
    voiceId: values.voiceId,
    categoryIds: values.categoryIds,
    authorIds: values.authorIds,
    contentFile,
    coverImage,
  };
};
