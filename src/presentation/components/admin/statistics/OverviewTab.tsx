import React from 'react';
import { ShoppingBag, Star, Users, Wallet } from 'lucide-react';
import type { Statistics } from '@/src/shared/types';
import { CatalogPanel } from './CatalogPanel';
import { Delta, Panel, RatingValue, StatTile } from './Panel';
import { RangeToggle, RevenueChart, type MonthRange } from './RevenueChart';
import { formatVnd } from '@/src/shared/utils';
import { changePercent, formatCount, formatPercent, parseMonth } from './format';
import type { StatTab } from './tabs';

const LinkButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button type="button" onClick={onClick} className="text-xs font-medium text-accent hover:underline cursor-pointer">
    {children}
  </button>
);

interface OverviewTabProps {
  statistics: Statistics;
  range: MonthRange;
  onRangeChange: (range: MonthRange) => void;
  onNavigate: (tab: StatTab) => void;
  /** The bestseller section; the page owns its period and data so they survive tab switches */
  bestsellers: React.ReactNode;
}

/** This month at a glance, the catalog's state, and what is selling in a chosen window. */
export const OverviewTab: React.FC<OverviewTabProps> = ({ statistics, range, onRangeChange, onNavigate, bestsellers }) => {
  const { overview, months, bookStatus } = statistics;
  const current = months.at(-1);
  const previousMonth = current ? ((parseMonth(current.month).month + 10) % 12) + 1 : null;
  const since = previousMonth ? `so với tháng ${previousMonth}` : '';
  const revenueChange = changePercent(overview.revenueThisMonth, overview.revenueLastMonth);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile icon={Wallet} label="Doanh thu tháng này" value={formatVnd(overview.revenueThisMonth)}>
          <p>
            {revenueChange === null ? (
              overview.revenueThisMonth > 0 ? `Tháng ${previousMonth} chưa có doanh thu` : 'Chưa có đơn thanh toán'
            ) : (
              <Delta value={revenueChange} format={formatPercent} suffix={since} />
            )}
          </p>
        </StatTile>
        <StatTile icon={ShoppingBag} label="Lượt mua tháng này" value={formatCount(overview.purchasesThisMonth)}>
          <p>
            <Delta
              value={overview.purchasesThisMonth - overview.purchasesLastMonth}
              format={formatCount}
              suffix={since}
            />
          </p>
        </StatTile>
        <StatTile icon={Users} label="Khách hàng" value={formatCount(overview.customers)}>
          <p>{formatCount(overview.buyers)} người đã mua ít nhất một sách</p>
        </StatTile>
        <StatTile
          icon={Star}
          label="Đánh giá trung bình"
          value={<RatingValue rating={overview.averageRating} reviews={overview.reviews} />}
        >
          <p>Từ {formatCount(overview.reviews)} đánh giá</p>
        </StatTile>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
        <Panel
          title="Doanh thu theo tháng"
          description={`${months.length} tháng gần nhất, tính theo ngày thanh toán`}
          action={<RangeToggle value={range} onChange={onRangeChange} />}
          className="lg:col-span-2"
        >
          <RevenueChart months={months} />
          <div className="mt-3 text-right">
            <LinkButton onClick={() => onNavigate('revenue')}>Xem chi tiết doanh thu</LinkButton>
          </div>
        </Panel>
        <CatalogPanel bookStatus={bookStatus} />
      </div>

      {bestsellers}
    </div>
  );
};
