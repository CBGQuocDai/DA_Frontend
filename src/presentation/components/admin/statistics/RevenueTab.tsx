import React from 'react';
import { Receipt, Wallet } from 'lucide-react';
import type { Statistics } from '@/src/shared/types';
import { Panel, StatTile } from './Panel';
import { RangeToggle, RevenueChart, type MonthRange } from './RevenueChart';
import { formatVnd } from '@/src/shared/utils';
import { formatCount } from './format';

interface RevenueTabProps {
  statistics: Statistics;
  range: MonthRange;
  onRangeChange: (range: MonthRange) => void;
}

/** Revenue in the chosen range: the total, the average purchase, and how it spreads over the months. */
export const RevenueTab: React.FC<RevenueTabProps> = ({ statistics, range, onRangeChange }) => {
  const { months } = statistics;
  const revenue = months.reduce((sum, m) => sum + m.revenue, 0);
  const purchases = months.reduce((sum, m) => sum + m.purchases, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-text-secondary">
          Số liệu {range} tháng gần nhất, tính theo ngày khách thanh toán thành công.
        </p>
        <RangeToggle value={range} onChange={onRangeChange} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatTile icon={Wallet} label={`Doanh thu ${range} tháng`} value={formatVnd(revenue)}>
          <p>Từ {formatCount(purchases)} lượt mua</p>
        </StatTile>
        <StatTile
          icon={Receipt}
          label="Trung bình mỗi lượt mua"
          value={purchases > 0 ? formatVnd(revenue / purchases) : '—'}
        >
          <p>Doanh thu chia cho số lượt mua trong {range} tháng</p>
        </StatTile>
      </div>

      <Panel title="Doanh thu theo tháng" description="Rê chuột hoặc chọn một cột để xem số lượt mua của tháng">
        {/* Fills the rest of the viewport on a desktop screen, never shorter than 20rem */}
        <RevenueChart months={months} className="h-[max(20rem,calc(100dvh-30rem))]" />
      </Panel>
    </div>
  );
};
