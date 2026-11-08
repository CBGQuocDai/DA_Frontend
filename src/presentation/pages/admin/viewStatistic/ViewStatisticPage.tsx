'use client';

import { useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { AdminLayout } from '@/src/presentation/layouts';
import {
  BestsellersSection,
  OverviewTab,
  RevenueTab,
  STAT_TABS,
  type MonthRange,
  type StatTab,
} from '@/src/presentation/components/admin/statistics';
import { ErrorState } from '@/src/presentation/components/common';
import { useBestsellers, useStatistics } from '@/src/presentation/hooks/admin';
import type { BestsellerPeriod } from '@/src/shared/types';
import { getApiErrorMessage } from '@/src/shared/utils';

const Skeleton = ({ className }: { className: string }) => (
  <div className={`rounded-xl border border-border bg-surface animate-pulse motion-reduce:animate-none ${className}`} />
);

export const ViewStatisticPage = () => {
  const [tab, setTab] = useState<StatTab>('overview');
  const [range, setRange] = useState<MonthRange>(12);
  const [period, setPeriod] = useState<BestsellerPeriod>('MONTH');
  // Both live here, not in the tabs, so switching tabs neither refetches nor forgets the chosen period
  const { statistics, loadedAt, error, isRefreshing, reload } = useStatistics();
  const bestsellers = useBestsellers(period);
  // 12 months are loaded once; a shorter range is the tail of them
  const shown = statistics && { ...statistics, months: statistics.months.slice(-range) };
  const refresh = () => {
    reload();
    bestsellers.reload();
  };
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Arrow keys move between tabs, as in any tab list
  const onTabKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + STAT_TABS.length) % STAT_TABS.length;
    setTab(STAT_TABS[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">Thống kê</h1>
            <p className="mt-1 text-sm text-text-muted">
              {loadedAt
                ? `Số liệu lúc ${loadedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}, ${loadedAt.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' })}`
                : 'Doanh thu, lượt mua, việc nghe sách và tình trạng kho'}
            </p>
          </div>
          <button
            type="button"
            onClick={refresh}
            disabled={!statistics || isRefreshing}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg border border-border bg-surface text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RotateCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin motion-reduce:animate-none' : ''}`} aria-hidden="true" />
            Làm mới
          </button>
        </header>

        <div role="tablist" aria-label="Nhóm thống kê" className="flex gap-1 overflow-x-auto border-b border-border -mx-1 px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {STAT_TABS.map((item, index) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                ref={(el) => {
                  tabRefs.current[index] = el;
                }}
                type="button"
                role="tab"
                id={`stat-tab-${item.id}`}
                aria-selected={selected}
                aria-controls="stat-panel"
                tabIndex={selected ? 0 : -1}
                onClick={() => setTab(item.id)}
                onKeyDown={(e) => onTabKeyDown(e, index)}
                className={`relative px-3 pb-3 pt-1 text-sm font-medium whitespace-nowrap transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-accent rounded-t-md ${
                  selected ? 'text-accent' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-colors ${selected ? 'bg-accent' : 'bg-transparent'}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>

        <div id="stat-panel" role="tabpanel" aria-labelledby={`stat-tab-${tab}`}>
          {error && !shown ? (
            <ErrorState
              message={getApiErrorMessage(error, 'Chưa tải được số liệu thống kê. Kiểm tra kết nối rồi thử lại.')}
              onRetry={reload}
            />
          ) : !shown ? (
            <div className="space-y-4" aria-busy="true" aria-label="Đang tải số liệu">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
              <Skeleton className="h-80" />
            </div>
          ) : (
            <div className={`transition-opacity ${isRefreshing ? 'opacity-60' : ''}`}>
              {tab === 'overview' && (
                <OverviewTab
                  statistics={shown}
                  range={range}
                  onRangeChange={setRange}
                  onNavigate={setTab}
                  bestsellers={
                    <BestsellersSection
                      period={period}
                      onPeriodChange={setPeriod}
                      bestsellers={bestsellers.bestsellers}
                      error={bestsellers.error}
                      isRefreshing={bestsellers.isRefreshing}
                      onRetry={bestsellers.reload}
                    />
                  }
                />
              )}
              {tab === 'revenue' && <RevenueTab statistics={shown} range={range} onRangeChange={setRange} />}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
