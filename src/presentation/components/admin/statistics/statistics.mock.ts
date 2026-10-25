// Mock data — replace with real API calls once the backend supports them
import type { Review } from '@/src/shared/types';
import type { BookCompletion, ChartPoint, RevenueStat, TopCategory, TopVoice } from './statistics.types';

export const MOCK_REVENUE: RevenueStat = {
  totalRevenue: 128500000,
  monthlyRevenue: 21500000,
  prevMonthRevenue: 18900000,
  totalOrders: 847,
};

export const MOCK_REVENUE_CHART: ChartPoint[] = [
  { label: 'T1', value: 8200000 },
  { label: 'T2', value: 9500000 },
  { label: 'T3', value: 7800000 },
  { label: 'T4', value: 11200000 },
  { label: 'T5', value: 13800000 },
  { label: 'T6', value: 12100000 },
  { label: 'T7', value: 15900000 },
  { label: 'T8', value: 21500000 },
];

export const MOCK_TOP_VOICES: TopVoice[] = [
  { id: 1, name: 'Minh Quang', usageCount: 142, rating: 4.8 },
  { id: 2, name: 'Thu Hà', usageCount: 98, rating: 4.7 },
  { id: 3, name: 'Anh Tuấn', usageCount: 87, rating: 4.6 },
  { id: 4, name: 'Lan Anh', usageCount: 65, rating: 4.9 },
  { id: 5, name: 'Hoàng Nam', usageCount: 43, rating: 4.5 },
];

export const MOCK_TOP_CATEGORIES: TopCategory[] = [
  { id: 1, name: 'Kinh tế', salesCount: 234, revenue: 35100000 },
  { id: 2, name: 'Tâm lý', salesCount: 198, revenue: 27720000 },
  { id: 3, name: 'Tiểu thuyết', salesCount: 176, revenue: 24640000 },
  { id: 4, name: 'Kỹ năng sống', salesCount: 155, revenue: 21700000 },
  { id: 5, name: 'Lịch sử', salesCount: 84, revenue: 19320000 },
];

export const MOCK_COMPLETION: BookCompletion[] = [
  { id: 1, title: 'Đắc Nhân Tâm', completed: 87, totalListens: 120, rate: 72 },
  { id: 2, title: 'Nhà Giả Kim', completed: 94, totalListens: 110, rate: 85 },
  { id: 3, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', completed: 45, totalListens: 80, rate: 56 },
  { id: 4, title: 'Không Diệt Không Sinh', completed: 38, totalListens: 95, rate: 40 },
  { id: 5, title: 'Sách Nói Kinh Doanh', completed: 110, totalListens: 130, rate: 85 },
];

export const MOCK_REVIEWS: Review[] = [
  { id: 1, bookId: 1, userId: 1, userName: 'Nguyễn Văn A', rating: 5, comment: 'Giọng đọc rất truyền cảm, nghe rất dễ chịu. Sách hay!', createdAt: '2024-12-01' },
  { id: 2, bookId: 2, userId: 2, userName: 'Trần Thị B', rating: 4, comment: 'Nội dung cuốn sách rất bổ ích, phù hợp cho người mới khởi nghiệp.', createdAt: '2024-11-28' },
  { id: 3, bookId: 3, userId: 3, userName: 'Lê Hoàng C', rating: 5, comment: 'Tuyệt vời! Đã nghe 3 lần và mỗi lần đều phát hiện điều mới.', createdAt: '2024-11-25' },
  { id: 4, bookId: 1, userId: 4, userName: 'Phạm Minh D', rating: 3, comment: 'Âm thanh hơi nhỏ ở một số đoạn, mong được cải thiện.', createdAt: '2024-11-20' },
  { id: 5, bookId: 4, userId: 5, userName: 'Hoàng Thu E', rating: 4, comment: 'Sách mang lại nhiều suy ngẫm. Giọng đọc chậm rãi, dễ theo dõi.', createdAt: '2024-11-15' },
];

export const WEEKLY_PUBLISH: ChartPoint[] = [
  { label: 'T2', value: 2 },
  { label: 'T3', value: 1 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 0 },
  { label: 'T6', value: 2 },
  { label: 'T7', value: 4 },
  { label: 'CN', value: 1 },
];

export const MONTHLY_PUBLISH: ChartPoint[] = [
  { label: 'T1', value: 12 },
  { label: 'T2', value: 8 },
  { label: 'T3', value: 15 },
  { label: 'T4', value: 11 },
  { label: 'T5', value: 19 },
  { label: 'T6', value: 14 },
];

export const revenueGrowthPercent = ({ monthlyRevenue, prevMonthRevenue }: RevenueStat) =>
  prevMonthRevenue > 0 ? Math.round(((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100) : 0;
