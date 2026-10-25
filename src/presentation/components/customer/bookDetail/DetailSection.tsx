'use client';

import React from 'react';

interface DetailSectionProps {
  title?: string;
  /** Rendered on the right of the title row. */
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** White card used for each block of the book detail page. */
export const DetailSection: React.FC<DetailSectionProps> = ({ title, aside, children, className = '' }) => (
  <section className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 ${className}`}>
    {title && (
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {aside}
      </div>
    )}
    {children}
  </section>
);
