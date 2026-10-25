'use client';

import { bookService, categoryService, voiceService } from '@/src/infrastructure/api/services';
import type { BookSummary } from '@/src/presentation/components/admin/statistics';
import { isBookPublished } from '@/src/shared/utils';
import { useAsyncData } from '../common';

// Published count and average rating are computed client-side from this sample until a stats endpoint exists
const BOOK_SAMPLE_SIZE = 100;

const EMPTY_SUMMARY: BookSummary = {
  totalBooks: 0,
  publishedBooks: 0,
  publicationRate: 0,
  averageRating: '0.0',
  totalVoices: 0,
  totalCategories: 0,
};

const loadSummary = async (): Promise<BookSummary> => {
  const [booksRes, voicesRes, categoriesRes] = await Promise.allSettled([
    bookService.getBooks({ page: 0, size: BOOK_SAMPLE_SIZE }),
    voiceService.getVoices(),
    categoryService.getCategories(),
  ]);

  const books = booksRes.status === 'fulfilled' ? booksRes.value?.content ?? [] : [];
  const totalBooks = booksRes.status === 'fulfilled' ? booksRes.value?.total ?? 0 : 0;
  const publishedBooks = books.filter(isBookPublished).length;
  const ratings = books.map((book) => book.averageRating ?? 0).filter((rating) => rating > 0);

  return {
    totalBooks,
    publishedBooks,
    publicationRate: totalBooks > 0 ? Math.round((publishedBooks / totalBooks) * 100) : 0,
    averageRating:
      ratings.length > 0 ? (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1) : '0.0',
    totalVoices:
      voicesRes.status === 'fulfilled' ? voicesRes.value?.total ?? voicesRes.value?.content?.length ?? 0 : 0,
    totalCategories: categoriesRes.status === 'fulfilled' ? categoriesRes.value.length : 0,
  };
};

/** Live book / voice / category counts for the statistics dashboard. */
export const useStatisticsSummary = () => {
  const { data, isLoading } = useAsyncData(loadSummary);
  return { summary: data ?? EMPTY_SUMMARY, isLoading };
};
