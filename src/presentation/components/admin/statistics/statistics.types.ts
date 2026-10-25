export interface ChartPoint {
  label: string;
  value: number;
}

export interface RevenueStat {
  totalRevenue: number;
  monthlyRevenue: number;
  prevMonthRevenue: number;
  totalOrders: number;
}

export interface TopVoice {
  id: number;
  name: string;
  usageCount: number;
  rating: number;
}

export interface TopCategory {
  id: number;
  name: string;
  salesCount: number;
  revenue: number;
}

export interface BookCompletion {
  id: number;
  title: string;
  completed: number;
  totalListens: number;
  rate: number;
}

export interface BookSummary {
  totalBooks: number;
  publishedBooks: number;
  publicationRate: number;
  averageRating: string;
  totalVoices: number;
  totalCategories: number;
}

export type StatTab = 'overview' | 'revenue' | 'books' | 'voices' | 'categories' | 'comments';
