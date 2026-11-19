import type { SearchParams } from '@/src/shared/types';

/** Bỏ `keyword` rỗng và điền mặc định cho phân trang. */
export const toSearchQuery = ({ keyword, page = 0, size = 10 }: SearchParams) => ({
  ...(keyword?.trim() ? { keyword: keyword.trim() } : {}),
  page,
  size,
});
