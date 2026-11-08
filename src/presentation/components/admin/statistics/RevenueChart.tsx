'use client';

import React, { useState } from 'react';
import type { StatisticsMonth } from '@/src/shared/types';
import { formatVnd } from '@/src/shared/utils';
import { formatCompact, formatCount, niceCeil, parseMonth } from './format';

const MONTH_RANGES = [6, 12] as const;
export type MonthRange = (typeof MONTH_RANGES)[number];

/** 6 / 12 month switch; sits in the heading row of whatever it filters. */
export const RangeToggle: React.FC<{ value: MonthRange; onChange: (range: MonthRange) => void }> = ({
  value,
  onChange,
}) => (
  <div role="group" aria-label="Khoảng thời gian" className="inline-flex rounded-lg bg-bg p-0.5 border border-border">
    {MONTH_RANGES.map((range) => (
      <button
        key={range}
        type="button"
        onClick={() => onChange(range)}
        aria-pressed={value === range}
        className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
          value === range ? 'bg-surface text-text-primary shadow-sm' : 'text-text-secondary hover:text-text-primary'
        }`}
      >
        {range} tháng
      </button>
    ))}
  </div>
);

const TICKS = 4;

/**
 * Revenue per month as columns on one baseline; the current month is solid, earlier months
 * lighter. Hover or focus a month for its revenue and purchases.
 */
export const RevenueChart: React.FC<{ months: StatisticsMonth[]; className?: string }> = ({
  months,
  className = 'h-60',
}) => {
  const [active, setActive] = useState<number | null>(null);
  const max = niceCeil(Math.max(...months.map((m) => m.revenue), 0));
  const ticks = Array.from({ length: TICKS + 1 }, (_, i) => (max / TICKS) * (TICKS - i));
  const hasRevenue = months.some((m) => m.revenue > 0);
  const hovered = active !== null ? months[active] : undefined;

  return (
    <div className={`flex flex-col ${className}`}>
      <div className="relative flex-1 flex min-h-0">
        <div className="w-12 flex flex-col justify-between text-[11px] text-text-muted tabular-nums text-right pr-2 -my-1.5">
          {ticks.map((tick) => (
            <span key={tick}>{hasRevenue ? formatCompact(tick) : tick === 0 ? '0' : ''}</span>
          ))}
        </div>

        <div className="relative flex-1">
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" aria-hidden="true">
            {ticks.map((tick) => (
              <div key={tick} className={`h-px ${tick === 0 ? 'bg-border' : 'bg-border-light'}`} />
            ))}
          </div>

          {!hasRevenue && (
            <p className="absolute inset-0 flex items-center justify-center text-sm text-text-muted">
              Chưa có doanh thu trong {months.length} tháng gần đây
            </p>
          )}

          <ol className="absolute inset-0 flex" aria-label={`Doanh thu ${months.length} tháng gần đây`}>
            {months.map((point, i) => {
              const label = parseMonth(point.month);
              const isCurrent = i === months.length - 1;
              return (
                <li key={point.month} className="flex-1 min-w-0">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    aria-label={`${label.long}: ${formatVnd(point.revenue)}, ${point.purchases} lượt mua`}
                    className="group relative h-full w-full flex items-end justify-center rounded-md focus-visible:outline-2 focus-visible:outline-accent cursor-default"
                  >
                    <span
                      className={`absolute inset-x-0.5 inset-y-0 rounded-md transition-colors ${
                        active === i ? 'bg-accent-light/70' : ''
                      }`}
                      aria-hidden="true"
                    />
                    {point.revenue > 0 && (
                      <span
                        className={`relative w-full max-w-6 rounded-t-[4px] transition-colors ${
                          isCurrent ? 'bg-accent' : 'bg-accent/45 group-hover:bg-accent/70'
                        }`}
                        style={{ height: `${Math.max((point.revenue / max) * 100, 1.5)}%` }}
                        aria-hidden="true"
                      />
                    )}
                  </button>
                </li>
              );
            })}
          </ol>

          {hovered && active !== null && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg bg-text-primary px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
              style={{
                left: `clamp(4.5rem, ${((active + 0.5) / months.length) * 100}%, calc(100% - 4.5rem))`,
                top: `calc(${100 - (hovered.revenue / max) * 100}% - 8px)`,
              }}
            >
              <p className="font-medium capitalize">{parseMonth(hovered.month).long}</p>
              <p className="mt-0.5 tabular-nums">{formatVnd(hovered.revenue)}</p>
              <p className="text-white/70">
                {formatCount(hovered.purchases)} lượt mua
              </p>
            </div>
          )}
        </div>
      </div>

      <ol className="ml-12 mt-2 flex text-[11px] text-text-muted" aria-hidden="true">
        {months.map((point, i) => {
          const label = parseMonth(point.month);
          return (
            <li
              key={point.month}
              className={`flex-1 min-w-0 text-center ${i === months.length - 1 ? 'font-semibold text-text-primary' : ''}`}
            >
              {label.short}
              {/* Year under the first label and each January, unless January sits right next to the first */}
              {(i === 0 || (label.month === 1 && i >= 2)) && (
                <span className="block text-[10px] text-text-muted font-normal">{label.year}</span>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
};
