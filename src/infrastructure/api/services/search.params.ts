/** Query of the admin list endpoints (`/authors/search`, `/categories/search`). */
export interface SearchParams {
  keyword?: string;
  /** Zero-based */
  page?: number;
  size?: number;
}

export const toSearchQuery = ({ keyword, page = 0, size = 10 }: SearchParams) => ({
  ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
  page,
  size,
});
