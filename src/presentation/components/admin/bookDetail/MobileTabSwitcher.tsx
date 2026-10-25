import React from 'react';

export type MobileTab = 'list' | 'detail';

interface MobileTabSwitcherProps {
  value: MobileTab;
  chapterCount: number;
  onChange: (tab: MobileTab) => void;
}

export const MobileTabSwitcher: React.FC<MobileTabSwitcherProps> = ({
  value,
  chapterCount,
  onChange,
}) => {
  const tabs: { id: MobileTab; label: string }[] = [
    { id: 'list', label: `Danh sách chương (${chapterCount})` },
    { id: 'detail', label: 'Nội dung & Biên tập' },
  ];

  return (
    <div className="flex lg:hidden border-b border-border bg-surface rounded-lg p-1 text-sm font-medium flex-shrink-0">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 text-center rounded-md transition-colors ${
            value === tab.id
              ? 'bg-accent text-white font-semibold'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};
