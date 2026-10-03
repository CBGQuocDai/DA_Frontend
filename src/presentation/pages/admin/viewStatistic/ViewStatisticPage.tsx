'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/src/presentation/layouts';
import { bookService, voiceService } from '@/src/infrastructure/api/services';
import type { Book, Review } from '@/src/shared/types';
import { ROUTES } from '@/src/shared/constants';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RevenueStat {
  totalRevenue: number;
  monthlyRevenue: number;
  prevMonthRevenue: number;
  totalOrders: number;
}

interface TopVoice {
  id: number;
  name: string;
  usageCount: number;
  rating: number;
}

interface TopCategory {
  id: number;
  name: string;
  salesCount: number;
  revenue: number;
}

interface BookCompletion {
  id: number;
  title: string;
  completed: number;
  totalListens: number;
  rate: number;
}

type StatTab = 'overview' | 'revenue' | 'books' | 'voices' | 'categories' | 'comments';

const TABS: { id: StatTab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'revenue', label: 'Doanh thu' },
  { id: 'books', label: 'Sách' },
  { id: 'voices', label: 'Giọng đọc' },
  { id: 'categories', label: 'Danh mục' },
  { id: 'comments', label: 'Bình luận' },
];

// ─── Mock Data (thay bằng API thực tế khi backend hỗ trợ) ────────────────────

const MOCK_REVENUE: RevenueStat = {
  totalRevenue: 128500000,
  monthlyRevenue: 21500000,
  prevMonthRevenue: 18900000,
  totalOrders: 847,
};

const MOCK_REVENUE_CHART = [
  { label: 'T1', value: 8200000 },
  { label: 'T2', value: 9500000 },
  { label: 'T3', value: 7800000 },
  { label: 'T4', value: 11200000 },
  { label: 'T5', value: 13800000 },
  { label: 'T6', value: 12100000 },
  { label: 'T7', value: 15900000 },
  { label: 'T8', value: 21500000 },
];

const MOCK_TOP_VOICES: TopVoice[] = [
  { id: 1, name: 'Minh Quang', usageCount: 142, rating: 4.8 },
  { id: 2, name: 'Thu Hà', usageCount: 98, rating: 4.7 },
  { id: 3, name: 'Anh Tuấn', usageCount: 87, rating: 4.6 },
  { id: 4, name: 'Lan Anh', usageCount: 65, rating: 4.9 },
  { id: 5, name: 'Hoàng Nam', usageCount: 43, rating: 4.5 },
];

const MOCK_TOP_CATEGORIES: TopCategory[] = [
  { id: 1, name: 'Kinh tế', salesCount: 234, revenue: 35100000 },
  { id: 2, name: 'Tâm lý', salesCount: 198, revenue: 27720000 },
  { id: 3, name: 'Tiểu thuyết', salesCount: 176, revenue: 24640000 },
  { id: 4, name: 'Kỹ năng sống', salesCount: 155, revenue: 21700000 },
  { id: 5, name: 'Lịch sử', salesCount: 84, revenue: 19320000 },
];

const MOCK_COMPLETION: BookCompletion[] = [
  { id: 1, title: 'Đắc Nhân Tâm', completed: 87, totalListens: 120, rate: 72 },
  { id: 2, title: 'Nhà Giả Kim', completed: 94, totalListens: 110, rate: 85 },
  { id: 3, title: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', completed: 45, totalListens: 80, rate: 56 },
  { id: 4, title: 'Không Diệt Không Sinh', completed: 38, totalListens: 95, rate: 40 },
  { id: 5, title: 'Sách Nói Kinh Doanh', completed: 110, totalListens: 130, rate: 85 },
];

const MOCK_REVIEWS: Review[] = [
  { id: 1, bookId: 1, userId: 1, userName: 'Nguyễn Văn A', rating: 5, comment: 'Giọng đọc rất truyền cảm, nghe rất dễ chịu. Sách hay!', createdAt: '2024-12-01' },
  { id: 2, bookId: 2, userId: 2, userName: 'Trần Thị B', rating: 4, comment: 'Nội dung cuốn sách rất bổ ích, phù hợp cho người mới khởi nghiệp.', createdAt: '2024-11-28' },
  { id: 3, bookId: 3, userId: 3, userName: 'Lê Hoàng C', rating: 5, comment: 'Tuyệt vời! Đã nghe 3 lần và mỗi lần đều phát hiện điều mới.', createdAt: '2024-11-25' },
  { id: 4, bookId: 1, userId: 4, userName: 'Phạm Minh D', rating: 3, comment: 'Âm thanh hơi nhỏ ở một số đoạn, mong được cải thiện.', createdAt: '2024-11-20' },
  { id: 5, bookId: 4, userId: 5, userName: 'Hoàng Thu E', rating: 4, comment: 'Sách mang lại nhiều suy ngẫm. Giọng đọc chậm rãi, dễ theo dõi.', createdAt: '2024-11-15' },
];

const WEEKLY_PUBLISH = [
  { label: 'T2', value: 2 },
  { label: 'T3', value: 1 },
  { label: 'T4', value: 3 },
  { label: 'T5', value: 0 },
  { label: 'T6', value: 2 },
  { label: 'T7', value: 4 },
  { label: 'CN', value: 1 },
];

const MONTHLY_PUBLISH = [
  { label: 'T1', value: 12 },
  { label: 'T2', value: 8 },
  { label: 'T3', value: 15 },
  { label: 'T4', value: 11 },
  { label: 'T5', value: 19 },
  { label: 'T6', value: 14 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export const ViewStatisticPage = () => {
  const [activeTab, setActiveTab] = useState<StatTab>('overview');
  const [totalBooks, setTotalBooks] = useState(0);
  const [publishedBooks, setPublishedBooks] = useState(0);
  const [totalVoices, setTotalVoices] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [averageRating, setAverageRating] = useState('0.0');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [booksRes, voicesRes, categoriesRes] = await Promise.allSettled([
          bookService.getBooks({ page: 0, size: 100 }),
          voiceService.getVoices(),
          bookService.getCategories(),
        ]);

        if (booksRes.status === 'fulfilled') {
          const data = booksRes.value;
          setTotalBooks(data?.total ?? 0);
          const content: Book[] = data?.content ?? [];
          setPublishedBooks(content.filter((b) => b.status === 'PUBLISHED' || b.isPublish).length);
          const rated = content.filter((b) => typeof b.averageRating === 'number' && b.averageRating > 0);
          if (rated.length > 0) {
            const avg = rated.reduce((sum, b) => sum + (b.averageRating || 0), 0) / rated.length;
            setAverageRating(avg.toFixed(1));
          }
        }
        if (voicesRes.status === 'fulfilled') {
          const d = voicesRes.value;
          setTotalVoices(d?.total ?? d?.content?.length ?? 0);
        }
        if (categoriesRes.status === 'fulfilled') {
          setTotalCategories(Array.isArray(categoriesRes.value) ? categoriesRes.value.length : 0);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Buổi sáng' : hour < 18 ? 'Buổi chiều' : 'Buổi tối';
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  const publicationRate = totalBooks > 0 ? Math.round((publishedBooks / totalBooks) * 100) : 0;

  const revenueGrowth = MOCK_REVENUE.prevMonthRevenue > 0
    ? Math.round(((MOCK_REVENUE.monthlyRevenue - MOCK_REVENUE.prevMonthRevenue) / MOCK_REVENUE.prevMonthRevenue) * 100)
    : 0;

  return (
    <AdminLayout>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 pb-5 border-b border-border">
          <p className="text-xs text-text-secondary tracking-wide">{dateStr}</p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
            {greeting}, Admin
          </h1>
          <p className="text-sm text-text-muted mt-1">Tổng quan nền tảng Sách Nói</p>
        </div>

        {/* Tab Nav */}
        <div className="flex-shrink-0 mt-4 flex items-center gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-text-secondary hover:bg-bg hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-y-auto mt-4">

          {/* ── Overview ── */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* KPI Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Tổng sách"
                  value={totalBooks}
                  sublabel={`${publishedBooks} đã xuất bản`}
                  isLoading={isLoading}
                  accent="accent"
                />
                <StatCard
                  label="Tỷ lệ xuất bản"
                  value={`${publicationRate}%`}
                  sublabel="tổng sách trên hệ thống"
                  isLoading={isLoading}
                  accent="success"
                />
                <StatCard
                  label="Giọng đọc"
                  value={totalVoices}
                  sublabel="sẵn sàng phục vụ"
                  isLoading={isLoading}
                  accent="indigo"
                />
                <StatCard
                  label="Danh mục"
                  value={totalCategories}
                  sublabel="phân loại sách"
                  isLoading={isLoading}
                  accent="amber"
                />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Revenue sparkline */}
                <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-text-primary">Doanh thu — 8 tháng</h2>
                    <span className="text-xs text-success font-medium">+{revenueGrowth}% so tháng trước</span>
                  </div>
                  <BarChart
                    data={MOCK_REVENUE_CHART}
                    maxValue={25000000}
                    formatValue={(v) => `${(v / 1000000).toFixed(0)}M`}
                  />
                </div>

                {/* Books sparkline */}
                <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-semibold text-text-primary">Xuất bản — 6 tháng</h2>
                    <Link href={`${ROUTES.ADMIN.STATISTICS}?tab=books`} className="text-xs text-accent hover:underline font-medium">
                      Chi tiết
                    </Link>
                  </div>
                  <BarChart
                    data={MONTHLY_PUBLISH}
                    maxValue={25}
                    formatValue={(v) => String(v)}
                  />
                </div>
              </div>

              {/* Top summaries */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-surface rounded-xl border border-border p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Giọng đọc phổ biến</h2>
                  <div className="space-y-2">
                    {MOCK_TOP_VOICES.slice(0, 3).map((v, i) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-slate-100 text-slate-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>{i + 1}</span>
                        <span className="text-sm text-text-primary font-medium flex-1 truncate">{v.name}</span>
                        <span className="text-xs text-text-muted">{v.usageCount} lượt dùng</span>
                        <span className="text-xs text-amber-600 font-medium">★ {v.rating}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('voices')} className="mt-3 text-xs text-accent hover:underline font-medium">
                    Xem tất cả →
                  </button>
                </div>

                <div className="bg-surface rounded-xl border border-border p-5">
                  <h2 className="text-sm font-semibold text-text-primary mb-3">Danh mục bán chạy</h2>
                  <div className="space-y-2">
                    {MOCK_TOP_CATEGORIES.slice(0, 3).map((c, i) => (
                      <div key={c.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-slate-100 text-slate-600' :
                          'bg-orange-100 text-orange-700'
                        }`}>{i + 1}</span>
                        <span className="text-sm text-text-primary font-medium flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-text-muted">{c.salesCount} lượt mua</span>
                        <span className="text-xs text-success font-medium">
                          {(c.revenue / 1000000).toFixed(0)}M
                        </span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => setActiveTab('categories')} className="mt-3 text-xs text-accent hover:underline font-medium">
                    Xem tất cả →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Revenue ── */}
          {activeTab === 'revenue' && (
            <RevenueTab data={MOCK_REVENUE} chartData={MOCK_REVENUE_CHART} />
          )}

          {/* ── Books ── */}
          {activeTab === 'books' && (
            <BooksTab
              totalBooks={totalBooks}
              publishedBooks={publishedBooks}
              publicationRate={publicationRate}
              averageRating={averageRating}
              isLoading={isLoading}
              weeklyData={WEEKLY_PUBLISH}
            />
          )}

          {/* ── Voices ── */}
          {activeTab === 'voices' && (
            <VoicesTab voices={MOCK_TOP_VOICES} />
          )}

          {/* ── Categories ── */}
          {activeTab === 'categories' && (
            <CategoriesTab categories={MOCK_TOP_CATEGORIES} />
          )}

          {/* ── Comments ── */}
          {activeTab === 'comments' && (
            <CommentsTab reviews={MOCK_REVIEWS} />
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

// ─── Revenue Tab ───────────────────────────────────────────────────────────────

function RevenueTab({ data, chartData }: { data: RevenueStat; chartData: typeof MOCK_REVENUE_CHART }) {
  const growth = data.prevMonthRevenue > 0
    ? Math.round(((data.monthlyRevenue - data.prevMonthRevenue) / data.prevMonthRevenue) * 100)
    : 0;

  return (
    <div className="space-y-5">
      {/* Revenue KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={fmtCurrency(data.totalRevenue)} sublabel="toàn thời gian" isLoading={false} accent="success" />
        <StatCard label="Tháng này" value={fmtCurrency(data.monthlyRevenue)} sublabel={`${growth >= 0 ? '+' : ''}${growth}% so tháng trước`} isLoading={false} accent="accent" />
        <StatCard label="Tháng trước" value={fmtCurrency(data.prevMonthRevenue)} sublabel="doanh thu thực" isLoading={false} accent="indigo" />
        <StatCard label="Tổng đơn hàng" value={data.totalOrders} sublabel="đơn đã thanh toán" isLoading={false} accent="amber" />
      </div>

      {/* Revenue Chart */}
      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Biểu đồ doanh thu</h2>
            <p className="text-xs text-text-muted mt-0.5">Theo tháng — 8 tháng gần nhất</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
              Doanh thu
            </span>
          </div>
        </div>
        <BarChart data={chartData} maxValue={30000000} formatValue={(v) => `${(v / 1000000).toFixed(0)}M`} />
      </div>
    </div>
  );
}

// ─── Books Tab ─────────────────────────────────────────────────────────────────

function BooksTab({
  totalBooks, publishedBooks, publicationRate, averageRating, isLoading,
  weeklyData,
}: {
  totalBooks: number; publishedBooks: number; publicationRate: number;
  averageRating: string; isLoading: boolean;
  weeklyData: typeof WEEKLY_PUBLISH;
}) {
  const [viewMode, setViewMode] = useState<'trend' | 'completion'>('trend');

  const completionData: BookCompletion[] = MOCK_COMPLETION;

  return (
    <div className="space-y-5">
      {/* Book KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng sách" value={totalBooks} sublabel="trên hệ thống" isLoading={isLoading} accent="accent" />
        <StatCard label="Đã xuất bản" value={publishedBooks} sublabel={`${publicationRate}% tổng sách`} isLoading={isLoading} accent="success" />
        <StatCard label="Chưa xuất bản" value={totalBooks - publishedBooks} sublabel="đang chờ duyệt" isLoading={isLoading} accent="amber" />
        <StatCard label="Đánh giá TB" value={`${averageRating} / 5`} sublabel="chất lượng trung bình" isLoading={isLoading} accent="indigo" />
      </div>

      {/* Chart toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('trend')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'trend' ? 'bg-accent text-white' : 'bg-bg text-text-secondary hover:text-text-primary'}`}
        >
          Xu hướng xuất bản
        </button>
        <button
          onClick={() => setViewMode('completion')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'completion' ? 'bg-accent text-white' : 'bg-bg text-text-secondary hover:text-text-primary'}`}
        >
          Tỷ lệ hoàn thành
        </button>
      </div>

      {viewMode === 'trend' ? (
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Xu hướng xuất bản — 7 ngày</h2>
              <p className="text-xs text-text-muted mt-0.5">Số sách được xuất bản mỗi ngày trong tuần</p>
            </div>
            <span className="text-xs text-text-muted">Tuần này</span>
          </div>
          <BarChart data={weeklyData} maxValue={7} formatValue={(v) => String(v)} />
        </div>
      ) : (
        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <h2 className="text-base font-semibold text-text-primary">Tỷ lệ hoàn thành sách</h2>
            <p className="text-xs text-text-muted mt-0.5">Tỷ lệ người dùng nghe hoàn thành từng cuốn sách</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border">
                <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Sách</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Hoàn thành</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Tổng lượt nghe</th>
                <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary w-48">Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {completionData.map((item) => (
                <tr key={item.id} className="hover:bg-bg transition-colors">
                  <td className="px-5 py-3.5 text-text-primary font-medium truncate max-w-xs">{item.title}</td>
                  <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{item.completed}</td>
                  <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{item.totalListens}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            item.rate >= 70 ? 'bg-success' :
                            item.rate >= 40 ? 'bg-accent' :
                            'bg-danger'
                          }`}
                          style={{ width: `${item.rate}%` }}
                        />
                      </div>
                      <span className={`text-xs font-medium tabular-nums w-10 text-right ${
                        item.rate >= 70 ? 'text-success' :
                        item.rate >= 40 ? 'text-accent' :
                        'text-danger'
                      }`}>{item.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Voices Tab ────────────────────────────────────────────────────────────────

function VoicesTab({ voices }: { voices: typeof MOCK_TOP_VOICES }) {
  const maxUsage = Math.max(...voices.map((v) => v.usageCount));

  return (
    <div className="space-y-5">
      {/* Voices KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng giọng đọc" value={voices.length} sublabel="trên hệ thống" isLoading={false} accent="accent" />
        <StatCard label="Tổng lượt sử dụng" value={voices.reduce((s, v) => s + v.usageCount, 0)} sublabel="tất cả giọng đọc" isLoading={false} accent="success" />
        <StatCard label="Giọng đọc hàng đầu" value={voices[0]?.name ?? '—'} sublabel={`${voices[0]?.usageCount ?? 0} lượt dùng`} isLoading={false} accent="indigo" />
      </div>

      {/* Voice ranking */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-text-primary">Bảng xếp hạng giọng đọc</h2>
          <p className="text-xs text-text-muted mt-0.5">Giọng đọc được sử dụng và yêu thích nhiều nhất</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary w-12">#</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Giọng đọc</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Lượt dùng</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Đánh giá</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary w-48">Xếp hạng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {voices.map((voice, i) => (
              <tr key={voice.id} className="hover:bg-bg transition-colors">
                <td className="px-5 py-3.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-bg text-text-muted'
                  }`}>{i + 1}</span>
                </td>
                <td className="px-5 py-3.5 text-text-primary font-medium">{voice.name}</td>
                <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{voice.usageCount}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-amber-600 font-medium">★ {voice.rating}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-accent`}
                        style={{ width: `${(voice.usageCount / maxUsage) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted tabular-nums w-10 text-right">
                      {Math.round((voice.usageCount / maxUsage) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Categories Tab ────────────────────────────────────────────────────────────

function CategoriesTab({ categories }: { categories: typeof MOCK_TOP_CATEGORIES }) {
  const maxRevenue = Math.max(...categories.map((c) => c.revenue));

  return (
    <div className="space-y-5">
      {/* Category KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng danh mục" value={categories.length} sublabel="phân loại sách" isLoading={false} accent="accent" />
        <StatCard label="Top danh mục" value={categories[0]?.name ?? '—'} sublabel={`${categories[0]?.salesCount ?? 0} lượt mua`} isLoading={false} accent="success" />
        <StatCard label="Doanh thu top 1" value={fmtCurrency(categories[0]?.revenue ?? 0)} sublabel="danh mục kinh tế" isLoading={false} accent="indigo" />
      </div>

      {/* Category ranking */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="px-5 pt-5 pb-3">
          <h2 className="text-base font-semibold text-text-primary">Danh mục bán chạy</h2>
          <p className="text-xs text-text-muted mt-0.5">Xếp hạng theo lượt bán và doanh thu</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border">
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary w-12">#</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-text-secondary">Danh mục</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Lượt mua</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary">Doanh thu</th>
              <th className="text-right px-5 py-3 text-xs font-medium text-text-secondary w-48">Biểu đồ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((cat, i) => (
              <tr key={cat.id} className="hover:bg-bg transition-colors">
                <td className="px-5 py-3.5">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-100 text-amber-700' :
                    i === 1 ? 'bg-slate-100 text-slate-600' :
                    i === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-bg text-text-muted'
                  }`}>{i + 1}</span>
                </td>
                <td className="px-5 py-3.5 text-text-primary font-medium">{cat.name}</td>
                <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{cat.salesCount}</td>
                <td className="px-5 py-3.5 text-right text-success font-medium tabular-nums">
                  {fmtCurrency(cat.revenue)}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          i === 0 ? 'bg-amber-500' :
                          i === 1 ? 'bg-accent' :
                          'bg-indigo-400'
                        }`}
                        style={{ width: `${(cat.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-text-muted tabular-nums w-10 text-right">
                      {Math.round((cat.revenue / maxRevenue) * 100)}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Comments Tab ──────────────────────────────────────────────────────────────

function CommentsTab({ reviews }: { reviews: typeof MOCK_REVIEWS }) {
  const [filter, setFilter] = useState<number | null>(null);

  const filtered = filter ? reviews.filter((r) => r.rating === filter) : reviews;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-5">
      {/* Review KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng bình luận" value={reviews.length} sublabel="phản hồi từ người dùng" isLoading={false} accent="accent" />
        <StatCard label="Đánh giá TB" value={`${avgRating} / 5`} sublabel="trên toàn nền tảng" isLoading={false} accent="amber" />
        <StatCard label="5 sao" value={reviews.filter((r) => r.rating === 5).length} sublabel="bình luận tích cực" isLoading={false} accent="success" />
        <StatCard label="Dưới 3 sao" value={reviews.filter((r) => r.rating < 3).length} sublabel="cần chú ý" isLoading={false} accent="danger" />
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-text-secondary">Lọc theo sao:</span>
        {([null, 5, 4, 3, 2, 1] as const).map((f) => (
          <button
            key={String(f)}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              filter === f ? (f === null ? 'bg-accent text-white' : 'bg-amber-100 text-amber-700') : 'bg-bg text-text-secondary hover:text-text-primary'
            }`}
          >
            {f === null ? 'Tất cả' : `★ ${f}`}
          </button>
        ))}
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-surface rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-text-muted">Không có bình luận nào phù hợp</p>
          </div>
        ) : (
          filtered.map((review) => (
            <div key={review.id} className="bg-surface rounded-xl border border-border p-5 hover:border-border-light transition-colors">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-semibold shrink-0">
                    {review.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{review.userName}</p>
                    <p className="text-xs text-text-muted">{review.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <svg key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'text-amber-400' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-sm text-text-primary leading-relaxed">{review.comment}</p>
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href={ROUTES.ADMIN.BOOK_DETAIL(review.bookId)}
                  className="text-xs text-accent hover:underline"
                >
                  Xem sách #{review.bookId}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Shared: StatCard ──────────────────────────────────────────────────────────

const accentMap: Record<string, { text: string; bar: string }> = {
  accent:  { text: 'text-accent',  bar: 'bg-accent' },
  success: { text: 'text-success',  bar: 'bg-success' },
  indigo:  { text: 'text-indigo-600', bar: 'bg-indigo-600' },
  amber:   { text: 'text-amber-600', bar: 'bg-amber-600' },
  danger:  { text: 'text-danger',  bar: 'bg-danger' },
};

function StatCard({
  label, value, sublabel, isLoading, accent,
}: {
  label: string; value: number | string; sublabel?: string;
  isLoading: boolean; accent: string;
}) {
  const style = accentMap[accent] ?? accentMap.accent;
  return (
    <div className="bg-surface rounded-xl border border-border p-5 hover:border-border-light transition-colors">
      <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
      <p className={`text-3xl font-bold mt-1.5 ${style.text} tabular-nums`}>
        {isLoading ? '—' : typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
      </p>
      {sublabel && <p className="text-xs text-text-muted mt-1">{sublabel}</p>}
    </div>
  );
}

// ─── Shared: BarChart ──────────────────────────────────────────────────────────

function BarChart<T extends { label: string; value: number }>({
  data, maxValue, formatValue, unit,
}: {
  data: T[];
  maxValue: number;
  formatValue: (v: number) => string;
  unit?: string;
}) {
  return (
    <div className="space-y-2">
      {data.map((d) => {
        const pct = maxValue > 0 ? Math.max(4, Math.round((d.value / maxValue) * 100)) : 0;
        return (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-text-muted w-8 shrink-0 text-right">{d.label}</span>
            <div className="flex-1 h-7 bg-bg rounded overflow-hidden flex items-center">
              <div
                className="h-2.5 bg-accent rounded-full transition-all"
                style={{ width: `${pct}%`, minWidth: pct > 0 ? '4px' : '0' }}
              />
            </div>
            <span className="text-xs text-text-secondary tabular-nums w-16 text-right shrink-0">
              {formatValue(d.value)}{unit ? ` ${unit}` : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Shared: formatters ───────────────────────────────────────────────────────

function fmtCurrency(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
}

export default ViewStatisticPage;
