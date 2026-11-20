// Kiểu dữ liệu dùng chung

/** Khung bọc response của backend (ApiResponse) */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** Một trang kết quả (PageResponse phía backend); `page` bắt đầu từ 0 */
export interface PaginatedResponse<T> {
  content: T[];
  total: number;
  totalPage: number;
  page: number;
  pageSize: number;
}

/** Query của các endpoint danh sách có tìm kiếm (`/authors/search`, `/categories/search`, `/voice`). */
export interface SearchParams {
  keyword?: string;
  /** Bắt đầu từ 0 */
  page?: number;
  size?: number;
}
