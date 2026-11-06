export type CustomerAuthorSort = 'name_asc' | 'book_count_desc';

export interface CustomerAuthorSummary {
  id: number;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  specialty?: string | null;
  bookCount: number;
}
