export interface CustomerBookFilters {
  keyword: string;
  categoryId?: number;
  authorId?: number;
  /** Zero-based API page; the URL displays pages starting at 1. */
  page: number;
}

const positiveInteger = (value: string | null) => {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) && number > 0 ? number : undefined;
};

export const parseBookFilters = (params: Pick<URLSearchParams, 'get'>): CustomerBookFilters => {
  const page = positiveInteger(params.get('page'));
  return {
    keyword: params.get('search')?.trim() ?? '',
    categoryId: positiveInteger(params.get('category')),
    authorId: positiveInteger(params.get('author')),
    page: page && page <= 2_147_483_647 ? page - 1 : 0,
  };
};

export const buildBookQuery = ({ keyword, categoryId, authorId, page }: CustomerBookFilters) => {
  const params = new URLSearchParams();
  if (keyword.trim()) params.set('search', keyword.trim());
  if (categoryId) params.set('category', String(categoryId));
  if (authorId) params.set('author', String(authorId));
  if (page > 0) params.set('page', String(page + 1));
  return params.toString();
};

export const updateBookFilters = (filters: CustomerBookFilters, changes: Partial<Omit<CustomerBookFilters, 'page'>>): CustomerBookFilters => ({
  ...filters,
  ...changes,
  page: 0,
});
