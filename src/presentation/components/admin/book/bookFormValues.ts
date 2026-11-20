import type { Book, BookPayload } from '@/src/shared/types';
import { uploadService } from '@/src/infrastructure/api/services';
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
 * Upload file PDF/ảnh bìa đã chọn thẳng lên cloud storage rồi dựng body JSON cho
 * endpoint tạo/cập nhật sách. Khi cập nhật mà không chọn file mới thì gửi lại
 * đường dẫn hiện tại của `book` để giữ nguyên file cũ.
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
