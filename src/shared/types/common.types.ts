// Common/Shared Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  content: T[];
  total: number;
  totalPage: number;
  page: number;
  pageSize: number;
}
