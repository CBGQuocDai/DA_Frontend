'use client';

import { useState } from 'react';
import { AdminLayout } from '@/src/presentation/layouts';
import {
  BooksTab,
  CategoriesTab,
  CommentsTab,
  OverviewTab,
  RevenueTab,
  VoicesTab,
  type StatTab,
} from '@/src/presentation/components/admin/statistics';
import { useStatisticsSummary } from '@/src/presentation/hooks/admin';

const TABS: { id: StatTab; label: string }[] = [
  { id: 'overview', label: 'Tổng quan' },
  { id: 'revenue', label: 'Doanh thu' },
  { id: 'books', label: 'Sách' },
  { id: 'voices', label: 'Giọng đọc' },
  { id: 'categories', label: 'Danh mục' },
  { id: 'comments', label: 'Bình luận' },
];

const getGreeting = (hour: number) => (hour < 12 ? 'Buổi sáng' : hour < 18 ? 'Buổi chiều' : 'Buổi tối');

export const ViewStatisticPage = () => {
  const [activeTab, setActiveTab] = useState<StatTab>('overview');
  const { summary, isLoading } = useStatisticsSummary();

  const now = new Date();
  const dateStr = now.toLocaleDateString('vi-VN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <AdminLayout>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex-shrink-0 pb-5 border-b border-border">
          <p className="text-xs text-text-secondary tracking-wide">{dateStr}</p>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mt-0.5">
            {getGreeting(now.getHours())}, Admin
          </h1>
          <p className="text-sm text-text-muted mt-1">Tổng quan nền tảng Sách Nói</p>
        </div>

        <div className="flex-shrink-0 mt-4 flex items-center gap-1 overflow-x-auto pb-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
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

        <div className="flex-1 min-h-0 overflow-y-auto mt-4">
          {activeTab === 'overview' && (
            <OverviewTab summary={summary} isLoading={isLoading} onNavigate={setActiveTab} />
          )}
          {activeTab === 'revenue' && <RevenueTab />}
          {activeTab === 'books' && <BooksTab summary={summary} isLoading={isLoading} />}
          {activeTab === 'voices' && <VoicesTab />}
          {activeTab === 'categories' && <CategoriesTab />}
          {activeTab === 'comments' && <CommentsTab />}
        </div>
      </div>
    </AdminLayout>
  );
};
