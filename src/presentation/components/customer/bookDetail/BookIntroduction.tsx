'use client';

import React from 'react';
import { DetailSection } from './DetailSection';

interface BookIntroductionProps {
  description?: string;
  tags: string[];
}

export const BookIntroduction: React.FC<BookIntroductionProps> = ({ description, tags }) => (
  <DetailSection title="Giới thiệu">
    <p className="text-sm sm:text-base text-slate-600 leading-relaxed whitespace-pre-line">
      {description || 'Sách chưa có phần giới thiệu.'}
    </p>
    {tags.length > 0 && (
      <div className="flex flex-wrap items-center gap-2 mt-6 pt-5 border-t border-slate-100">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>
    )}
  </DetailSection>
);
