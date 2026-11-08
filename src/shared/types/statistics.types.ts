// Admin dashboard (GET /admin/statistics). Months and "this month" follow Vietnam time.

import type { BookStatus } from './book.types';

export interface StatisticsOverview {
  revenueThisMonth: number;
  revenueLastMonth: number;
  /** Paid purchases this month */
  purchasesThisMonth: number;
  purchasesLastMonth: number;
  customers: number;
  /** Customers who own at least one book */
  buyers: number;
  reviews: number;
  averageRating: number;
}

export interface StatisticsMonth {
  /** yyyy-MM */
  month: string;
  revenue: number;
  /** Paid purchases in the month */
  purchases: number;
}

export interface Statistics {
  overview: StatisticsOverview;
  /** Every status present, zero when unused */
  bookStatus: Record<BookStatus, number>;
  /** Oldest first, one entry per month */
  months: StatisticsMonth[];
}

/** Rolling windows ending now, each compared with the window of the same length before it */
export type BestsellerPeriod = 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' | 'ALL';

/** GET /admin/statistics/purchases: all purchases in a period against the one before */
export interface PurchaseTrend {
  purchases: number;
  /** Absent for ALL */
  previousPurchases?: number | null;
}
