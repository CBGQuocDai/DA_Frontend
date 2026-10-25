'use client';

import React from 'react';
import Link from 'next/link';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center flex-wrap gap-2 text-xs text-text-secondary font-medium">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-accent transition-colors">
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast ? 'text-accent font-semibold truncate max-w-[200px] sm:max-w-md' : 'text-text-secondary'
                }
              >
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-text-muted">/</span>}
          </li>
        );
      })}
    </ol>
  </nav>
);
