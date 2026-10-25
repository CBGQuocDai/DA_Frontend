'use client';

import React, { useState } from 'react';
import type { BookSummary } from './statistics.types';
import { MOCK_COMPLETION, WEEKLY_PUBLISH } from './statistics.mock';
import { BarChart, ProgressBar, StatCard, StatPanel, thClass } from './StatParts';

type ViewMode = 'trend' | 'completion';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'trend', label: 'Xu hướng xuất bản' },
  { id: 'completion', label: 'Tỷ lệ hoàn thành' },
];

const completionColor = (rate: number) =>
  rate >= 70 ? ['bg-success', 'text-success'] : rate >= 40 ? ['bg-accent', 'text-accent'] : ['bg-error', 'text-error'];

export const BooksTab: React.FC<{ summary: BookSummary; isLoading: boolean }> = ({ summary, isLoading }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('trend');
  const { totalBooks, publishedBooks, publicationRate, averageRating } = summary;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng sách" value={totalBooks} sublabel="trên hệ thống" isLoading={isLoading} accent="accent" />
        <StatCard
          label="Đã xuất bản"
          value={publishedBooks}
          sublabel={`${publicationRate}% tổng sách`}
          isLoading={isLoading}
          accent="success"
        />
        <StatCard
          label="Chưa xuất bản"
          value={totalBooks - publishedBooks}
          sublabel="đang chờ duyệt"
          isLoading={isLoading}
          accent="amber"
        />
        <StatCard
          label="Đánh giá TB"
          value={`${averageRating} / 5`}
          sublabel="chất lượng trung bình"
          isLoading={isLoading}
          accent="indigo"
        />
      </div>

      <div className="flex items-center gap-2">
        {VIEW_MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setViewMode(mode.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              viewMode === mode.id ? 'bg-accent text-white' : 'bg-bg text-text-secondary hover:text-text-primary'
            }`}
          >
            {mode.label}
          </button>
        ))}
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
          <BarChart data={WEEKLY_PUBLISH} maxValue={7} />
        </div>
      ) : (
        <StatPanel title="Tỷ lệ hoàn thành sách" description="Tỷ lệ người dùng nghe hoàn thành từng cuốn sách">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-t border-border">
                <th className={`text-left ${thClass}`}>Sách</th>
                <th className={`text-right ${thClass}`}>Hoàn thành</th>
                <th className={`text-right ${thClass}`}>Tổng lượt nghe</th>
                <th className={`text-right ${thClass} w-48`}>Tỷ lệ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {MOCK_COMPLETION.map((item) => {
                const [bar, label] = completionColor(item.rate);
                return (
                  <tr key={item.id} className="hover:bg-bg transition-colors">
                    <td className="px-5 py-3.5 text-text-primary font-medium truncate max-w-xs">{item.title}</td>
                    <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{item.completed}</td>
                    <td className="px-5 py-3.5 text-right text-text-secondary tabular-nums">{item.totalListens}</td>
                    <td className="px-5 py-3.5">
                      <ProgressBar percent={item.rate} barClassName={bar} labelClassName={label} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </StatPanel>
      )}
    </div>
  );
};
