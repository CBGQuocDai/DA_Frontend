import React from 'react';
import { MOCK_TOP_CATEGORIES } from './statistics.mock';
import { ProgressBar, RankBadge, StatCard, StatPanel, formatCompact, thClass } from './StatParts';

const BAR_COLORS = ['bg-amber-500', 'bg-accent'];

export const CategoriesTab: React.FC = () => {
  const categories = MOCK_TOP_CATEGORIES;
  const maxRevenue = Math.max(...categories.map((c) => c.revenue));
  const top = categories[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng danh mục" value={categories.length} sublabel="phân loại sách" accent="accent" />
        <StatCard
          label="Top danh mục"
          value={top?.name ?? '—'}
          sublabel={`${top?.salesCount ?? 0} lượt mua`}
          accent="success"
        />
        <StatCard
          label="Doanh thu top 1"
          value={formatCompact(top?.revenue ?? 0)}
          sublabel={`danh mục ${top?.name.toLowerCase() ?? ''}`}
          accent="indigo"
        />
      </div>

      <StatPanel title="Danh mục bán chạy" description="Xếp hạng theo lượt bán và doanh thu">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border">
              <th className={`text-left ${thClass} w-12`}>#</th>
              <th className={`text-left ${thClass}`}>Danh mục</th>
              <th className={`text-right ${thClass}`}>Lượt mua</th>
              <th className={`text-right ${thClass}`}>Doanh thu</th>
              <th className={`text-right ${thClass} w-48`}>Biểu đồ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.map((category, i) => (
              <tr key={category.id} className="hover:bg-bg transition-colors">
                <td className="px-5 py-3.5">
                  <RankBadge index={i} />
                </td>
                <td className="px-5 py-3.5 text-text-primary font-medium">{category.name}</td>
                <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{category.salesCount}</td>
                <td className="px-5 py-3.5 text-right text-success font-medium tabular-nums">
                  {formatCompact(category.revenue)}
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar
                    percent={(category.revenue / maxRevenue) * 100}
                    barClassName={BAR_COLORS[i] ?? 'bg-indigo-400'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatPanel>
    </div>
  );
};
