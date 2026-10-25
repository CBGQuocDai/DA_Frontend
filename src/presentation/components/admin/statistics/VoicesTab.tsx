import React from 'react';
import { MOCK_TOP_VOICES } from './statistics.mock';
import { ProgressBar, RankBadge, StatCard, StatPanel, thClass } from './StatParts';

export const VoicesTab: React.FC = () => {
  const voices = MOCK_TOP_VOICES;
  const maxUsage = Math.max(...voices.map((v) => v.usageCount));
  const top = voices[0];

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard label="Tổng giọng đọc" value={voices.length} sublabel="trên hệ thống" accent="accent" />
        <StatCard
          label="Tổng lượt sử dụng"
          value={voices.reduce((sum, v) => sum + v.usageCount, 0)}
          sublabel="tất cả giọng đọc"
          accent="success"
        />
        <StatCard
          label="Giọng đọc hàng đầu"
          value={top?.name ?? '—'}
          sublabel={`${top?.usageCount ?? 0} lượt dùng`}
          accent="indigo"
        />
      </div>

      <StatPanel title="Bảng xếp hạng giọng đọc" description="Giọng đọc được sử dụng và yêu thích nhiều nhất">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-t border-border">
              <th className={`text-left ${thClass} w-12`}>#</th>
              <th className={`text-left ${thClass}`}>Giọng đọc</th>
              <th className={`text-right ${thClass}`}>Lượt dùng</th>
              <th className={`text-right ${thClass}`}>Đánh giá</th>
              <th className={`text-right ${thClass} w-48`}>Xếp hạng</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {voices.map((voice, i) => (
              <tr key={voice.id} className="hover:bg-bg transition-colors">
                <td className="px-5 py-3.5">
                  <RankBadge index={i} />
                </td>
                <td className="px-5 py-3.5 text-text-primary font-medium">{voice.name}</td>
                <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{voice.usageCount}</td>
                <td className="px-5 py-3.5 text-right">
                  <span className="text-amber-600 font-medium">★ {voice.rating}</span>
                </td>
                <td className="px-5 py-3.5">
                  <ProgressBar percent={(voice.usageCount / maxUsage) * 100} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatPanel>
    </div>
  );
};
