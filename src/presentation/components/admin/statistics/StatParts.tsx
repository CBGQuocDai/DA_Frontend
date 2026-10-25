import React from 'react';
import type { ChartPoint } from './statistics.types';

const ACCENTS = {
  accent: 'text-accent',
  success: 'text-success',
  indigo: 'text-indigo-600',
  amber: 'text-amber-600',
  error: 'text-error',
} as const;

export type StatAccent = keyof typeof ACCENTS;

interface StatCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  isLoading?: boolean;
  accent: StatAccent;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, sublabel, isLoading = false, accent }) => (
  <div className="bg-surface rounded-xl border border-border p-5 hover:border-border-light transition-colors">
    <p className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</p>
    <p className={`text-3xl font-bold mt-1.5 ${ACCENTS[accent]} tabular-nums`}>
      {isLoading ? '—' : typeof value === 'number' ? value.toLocaleString('vi-VN') : value}
    </p>
    {sublabel && <p className="text-xs text-text-muted mt-1">{sublabel}</p>}
  </div>
);

interface BarChartProps {
  data: ChartPoint[];
  maxValue: number;
  formatValue?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, maxValue, formatValue = String }) => (
  <div className="space-y-2">
    {data.map((point) => {
      const pct = maxValue > 0 ? Math.max(4, Math.round((point.value / maxValue) * 100)) : 0;
      return (
        <div key={point.label} className="flex items-center gap-3">
          <span className="text-xs text-text-muted w-8 shrink-0 text-right">{point.label}</span>
          <div className="flex-1 h-7 bg-bg rounded overflow-hidden flex items-center">
            <div className="h-2.5 bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-text-secondary tabular-nums w-16 text-right shrink-0">
            {formatValue(point.value)}
          </span>
        </div>
      );
    })}
  </div>
);

const RANK_STYLES = ['bg-amber-100 text-amber-700', 'bg-slate-100 text-slate-600', 'bg-orange-100 text-orange-700'];

/** Gold / silver / bronze circle for the top 3, neutral after that. */
export const RankBadge: React.FC<{ index: number }> = ({ index }) => (
  <span
    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
      RANK_STYLES[index] ?? 'bg-bg text-text-muted'
    }`}
  >
    {index + 1}
  </span>
);

interface ProgressBarProps {
  percent: number;
  barClassName?: string;
  labelClassName?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  barClassName = 'bg-accent',
  labelClassName = 'text-text-muted',
}) => (
  <div className="flex items-center gap-2">
    <div className="flex-1 h-2 bg-bg rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${barClassName}`} style={{ width: `${percent}%` }} />
    </div>
    <span className={`text-xs font-medium tabular-nums w-10 text-right ${labelClassName}`}>{Math.round(percent)}%</span>
  </div>
);

export const StatPanel: React.FC<{ title: string; description?: string; aside?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  description,
  aside,
  children,
}) => (
  <div className="bg-surface rounded-xl border border-border overflow-hidden">
    <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
      <div>
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {aside}
    </div>
    {children}
  </div>
);

export const thClass = 'px-5 py-3 text-xs font-medium text-text-secondary';

/** 21500000 -> "21.5M", 4500 -> "5K" */
export const formatCompact = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
  return String(value);
};

/** 21500000 -> "22M" (chart axis labels) */
export const formatMillions = (value: number) => `${(value / 1000000).toFixed(0)}M`;
