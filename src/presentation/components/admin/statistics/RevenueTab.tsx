import React from 'react';
import { MOCK_REVENUE, MOCK_REVENUE_CHART, revenueGrowthPercent } from './statistics.mock';
import { BarChart, StatCard, formatCompact, formatMillions } from './StatParts';

export const RevenueTab: React.FC = () => {
  const data = MOCK_REVENUE;
  const growth = revenueGrowthPercent(data);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng doanh thu" value={formatCompact(data.totalRevenue)} sublabel="toàn thời gian" accent="success" />
        <StatCard
          label="Tháng này"
          value={formatCompact(data.monthlyRevenue)}
          sublabel={`${growth >= 0 ? '+' : ''}${growth}% so tháng trước`}
          accent="accent"
        />
        <StatCard label="Tháng trước" value={formatCompact(data.prevMonthRevenue)} sublabel="doanh thu thực" accent="indigo" />
        <StatCard label="Tổng đơn hàng" value={data.totalOrders} sublabel="đơn đã thanh toán" accent="amber" />
      </div>

      <div className="bg-surface rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Biểu đồ doanh thu</h2>
            <p className="text-xs text-text-muted mt-0.5">Theo tháng — 8 tháng gần nhất</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs">
            <span className="w-3 h-3 rounded-sm bg-accent inline-block" />
            Doanh thu
          </span>
        </div>
        <BarChart data={MOCK_REVENUE_CHART} maxValue={30000000} formatValue={formatMillions} />
      </div>
    </div>
  );
};
