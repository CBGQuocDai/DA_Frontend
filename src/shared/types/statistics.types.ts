// Trang thống kê của admin (GET /admin/statistics). Tháng và "tháng này" tính theo giờ Việt Nam.

import type { BookStatus } from './book.types';

export interface StatisticsOverview {
  revenueThisMonth: number;
  revenueLastMonth: number;
  /** Lượt mua đã thanh toán trong tháng này */
  purchasesThisMonth: number;
  purchasesLastMonth: number;
  customers: number;
  /** Khách hàng sở hữu ít nhất một cuốn sách */
  buyers: number;
  reviews: number;
  averageRating: number;
}

export interface StatisticsMonth {
  /** yyyy-MM */
  month: string;
  revenue: number;
  /** Lượt mua đã thanh toán trong tháng */
  purchases: number;
}

export interface Statistics {
  overview: StatisticsOverview;
  /** Luôn đủ mọi trạng thái, bằng 0 khi không có sách nào */
  bookStatus: Record<BookStatus, number>;
  /** Cũ nhất trước, mỗi tháng một phần tử */
  months: StatisticsMonth[];
}

/** Khoảng thời gian tính lùi từ hiện tại, so với khoảng cùng độ dài ngay trước đó */
export type BestsellerPeriod = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';

/** GET /admin/statistics/purchases: tổng lượt mua trong kỳ so với kỳ liền trước */
export interface PurchaseTrend {
  purchases: number;
  /** Không có khi chọn ALL */
  previousPurchases?: number | null;
}
