import React from 'react';

export const BookDetailSkeleton: React.FC = () => (
  <div className="h-full flex flex-col space-y-3.5">
    <div className="h-5 w-32 bg-surface rounded animate-pulse" />
    <div className="h-20 bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
    <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
      <div className="w-full lg:w-[350px] xl:w-[380px] 2xl:w-[410px] h-full bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
      <div className="flex-1 h-full bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
    </div>
  </div>
);
