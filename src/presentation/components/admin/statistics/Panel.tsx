import React from 'react';

interface PanelProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** White card with a heading row; every dashboard section sits in one. */
export const Panel: React.FC<PanelProps> = ({ title, description, action, className = '', children }) => (
  <section className={`bg-surface rounded-xl border border-border p-5 ${className}`}>
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2 mb-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        {description && <p className="text-xs text-text-muted mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </section>
);

interface DeltaProps {
  value: number;
  format: (abs: number) => string;
  /** Names the period compared with, e.g. "so với tháng 10" */
  suffix?: string;
  /** Text size; the colour follows the direction */
  className?: string;
}

/** Signed change versus a named period: green for a rise, red for a fall (every figure here is better higher). */
export const Delta: React.FC<DeltaProps> = ({ value, format, suffix, className = 'text-xs' }) => {
  if (value === 0) {
    return <span className={`${className} text-text-muted`}>Không đổi{suffix && ` ${suffix}`}</span>;
  }
  const up = value > 0;
  return (
    <span className={`${className} font-medium tabular-nums ${up ? 'text-success' : 'text-error'}`}>
      <span aria-hidden="true">{up ? '▲' : '▼'}</span>
      <span className="sr-only">{up ? 'Tăng' : 'Giảm'}</span> {format(Math.abs(value))}
      {suffix && <span className="font-normal text-text-muted"> {suffix}</span>}
    </span>
  );
};

interface StatTileProps {
  icon?: React.ElementType;
  label: string;
  value: React.ReactNode;
  /** One or two short lines under the value: a delta, a total, what the figure includes */
  children?: React.ReactNode;
}

/** A single figure with its label; tiles sit in rows of three or four. */
export const StatTile: React.FC<StatTileProps> = ({ icon: Icon, label, value, children }) => (
  <div className="bg-surface rounded-xl border border-border p-5 min-w-0">
    <p className="flex items-center gap-2 text-sm font-medium text-text-secondary">
      {Icon && <Icon className="w-4 h-4 text-text-muted" aria-hidden="true" />}
      {label}
    </p>
    <p
      className="mt-2 text-3xl font-semibold tracking-tight text-text-primary truncate"
      title={typeof value === 'string' ? value : undefined}
    >
      {value}
    </p>
    {children && <div className="mt-1.5 space-y-0.5 text-xs text-text-muted">{children}</div>}
  </div>
);

/** "4,7 / 5", or a muted "Chưa có" when nothing has been rated yet. */
export const RatingValue: React.FC<{ rating: number; reviews: number }> = ({ rating, reviews }) =>
  reviews > 0 ? (
    <>
      {rating.toLocaleString('vi-VN', { minimumFractionDigits: 1 })}
      <span className="text-base font-medium text-text-muted"> / 5</span>
    </>
  ) : (
    <span className="text-text-muted">Chưa có</span>
  );
