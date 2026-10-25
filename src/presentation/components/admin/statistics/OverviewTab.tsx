import React from 'react';
import type { BookSummary, StatTab } from './statistics.types';
import {
  MOCK_REVENUE,
  MOCK_REVENUE_CHART,
  MOCK_TOP_CATEGORIES,
  MOCK_TOP_VOICES,
  MONTHLY_PUBLISH,
  revenueGrowthPercent,
} from './statistics.mock';
import { BarChart, RankBadge, StatCard, formatMillions } from './StatParts';

const TOP_PREVIEW_COUNT = 3;

interface OverviewTabProps {
  summary: BookSummary;
  isLoading: boolean;
  onNavigate: (tab: StatTab) => void;
}

const LinkButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({
  onClick,
  children,
  className = '',
}) => (
  <button type="button" onClick={onClick} className={`text-xs text-accent hover:underline font-medium ${className}`}>
    {children}
  </button>
);

const TopList: React.FC<{
  title: string;
  rows: { id: number; name: string; meta: string; value: React.ReactNode }[];
  onShowAll: () => void;
}> = ({ title, rows, onShowAll }) => (
  <div className="bg-surface rounded-xl border border-border p-5">
    <h2 className="text-sm font-semibold text-text-primary mb-3">{title}</h2>
    <div className="space-y-2">
      {rows.map((row, i) => (
        <div key={row.id} className="flex items-center gap-3">
          <RankBadge index={i} />
          <span className="text-sm text-text-primary font-medium flex-1 truncate">{row.name}</span>
          <span className="text-xs text-text-muted">{row.meta}</span>
          {row.value}
        </div>
      ))}
    </div>
    <LinkButton onClick={onShowAll} className="mt-3">
      Xem tất cả →
    </LinkButton>
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({ summary, isLoading, onNavigate }) => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        label="Tổng sách"
        value={summary.totalBooks}
        sublabel={`${summary.publishedBooks} đã xuất bản`}
        isLoading={isLoading}
        accent="accent"
      />
      <StatCard
        label="Tỷ lệ xuất bản"
        value={`${summary.publicationRate}%`}
        sublabel="tổng sách trên hệ thống"
        isLoading={isLoading}
        accent="success"
      />
      <StatCard label="Giọng đọc" value={summary.totalVoices} sublabel="sẵn sàng phục vụ" isLoading={isLoading} accent="indigo" />
      <StatCard label="Danh mục" value={summary.totalCategories} sublabel="phân loại sách" isLoading={isLoading} accent="amber" />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
      <div className="lg:col-span-3 bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Doanh thu — 8 tháng</h2>
          <span className="text-xs text-success font-medium">+{revenueGrowthPercent(MOCK_REVENUE)}% so tháng trước</span>
        </div>
        <BarChart data={MOCK_REVENUE_CHART} maxValue={25000000} formatValue={formatMillions} />
      </div>

      <div className="lg:col-span-2 bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-primary">Xuất bản — 6 tháng</h2>
          <LinkButton onClick={() => onNavigate('books')}>Chi tiết</LinkButton>
        </div>
        <BarChart data={MONTHLY_PUBLISH} maxValue={25} />
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TopList
        title="Giọng đọc phổ biến"
        rows={MOCK_TOP_VOICES.slice(0, TOP_PREVIEW_COUNT).map((voice) => ({
          id: voice.id,
          name: voice.name,
          meta: `${voice.usageCount} lượt dùng`,
          value: <span className="text-xs text-amber-600 font-medium">★ {voice.rating}</span>,
        }))}
        onShowAll={() => onNavigate('voices')}
      />
      <TopList
        title="Danh mục bán chạy"
        rows={MOCK_TOP_CATEGORIES.slice(0, TOP_PREVIEW_COUNT).map((category) => ({
          id: category.id,
          name: category.name,
          meta: `${category.salesCount} lượt mua`,
          value: <span className="text-xs text-success font-medium">{formatMillions(category.revenue)}</span>,
        }))}
        onShowAll={() => onNavigate('categories')}
      />
    </div>
  </div>
);
