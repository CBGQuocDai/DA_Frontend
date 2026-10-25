'use client';

import React, { memo } from 'react';
import { ChevronDown, ChevronUp, Mic, MoreVertical, Plus } from 'lucide-react';
import { Button, EmptyState } from '@/src/presentation/components/common';
import type { Voice } from '@/src/shared/types';
import { VoicePlayButton } from './VoicePlayButton';

export type VoiceSortField = 'name' | 'id';
export type SortDir = 'asc' | 'desc';

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 5;

const SortIndicator: React.FC<{ active: boolean; dir: SortDir }> = ({ active, dir }) => {
  if (!active) return <span className="opacity-0 group-hover:opacity-30 ml-1">↕</span>;
  const Icon = dir === 'asc' ? ChevronUp : ChevronDown;
  return <Icon className="w-3.5 h-3.5 ml-1 inline-block" strokeWidth={2.5} />;
};

const SkeletonRow: React.FC = () => (
  <tr>
    <td className="px-4 py-4 text-center">
      <div className="h-4 w-6 bg-bg rounded animate-pulse mx-auto" />
    </td>
    <td className="px-4 py-4">
      <div className="h-4 w-32 bg-bg rounded animate-pulse" />
    </td>
    <td className="px-4 py-4">
      <div className="h-3.5 w-40 bg-bg rounded animate-pulse" />
    </td>
    <td className="px-4 py-4 text-center">
      <div className="h-7 w-24 bg-bg rounded-full animate-pulse mx-auto" />
    </td>
    <td className="px-4 py-4 text-right pr-5">
      <div className="h-7 w-7 bg-bg rounded-lg animate-pulse ml-auto" />
    </td>
  </tr>
);

interface VoiceTableProps {
  voices: Voice[];
  startIndex: number;
  isLoading: boolean;
  isFiltered: boolean;
  sortField: VoiceSortField;
  sortDir: SortDir;
  playingVoiceId: number | null;
  isPlaying: boolean;
  onSort: (field: VoiceSortField) => void;
  onTogglePlay: (voice: Voice) => void;
  onOpenMenu: (e: React.MouseEvent<HTMLButtonElement>, voice: Voice) => void;
  onClearSearch: () => void;
  onCreate: () => void;
}

/** Memoized so the page's audio time updates do not re-render every row. */
export const VoiceTable = memo(function VoiceTable({
  voices,
  startIndex,
  isLoading,
  isFiltered,
  sortField,
  sortDir,
  playingVoiceId,
  isPlaying,
  onSort,
  onTogglePlay,
  onOpenMenu,
  onClearSearch,
  onCreate,
}: VoiceTableProps) {
  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }, (_, i) => <SkeletonRow key={i} />);
    }

    if (voices.length === 0) {
      return (
        <tr>
          <td colSpan={COLUMN_COUNT} className="px-4 py-24">
            {isFiltered ? (
              <EmptyState
                title="Không tìm thấy giọng đọc phù hợp"
                description="Thử tìm kiếm với từ khóa khác"
                action={
                  <button
                    type="button"
                    onClick={onClearSearch}
                    className="text-xs text-accent hover:underline font-medium cursor-pointer"
                  >
                    Xóa bộ lọc
                  </button>
                }
                className="border-none bg-transparent"
              />
            ) : (
              <EmptyState
                icon={
                  <span className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center">
                    <Mic className="w-6 h-6" />
                  </span>
                }
                title="Chưa có giọng đọc nào"
                description="Bắt đầu tạo giọng đọc mẫu đầu tiên cho hệ thống"
                action={
                  <Button onClick={onCreate} size="sm" className="h-9 px-4 rounded-lg">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm giọng mới</span>
                  </Button>
                }
                className="border-none bg-transparent"
              />
            )}
          </td>
        </tr>
      );
    }

    return voices.map((voice, index) => {
      const isActive = playingVoiceId === voice.id;
      return (
        <tr
          key={voice.id}
          className={`hover:bg-accent-light/30 transition-colors group ${isActive ? 'bg-accent-light/40' : ''}`}
        >
          <td className="px-4 py-3.5 text-center text-xs font-mono text-text-muted tabular-nums align-middle">
            {startIndex + index + 1}
          </td>
          <td className="px-4 py-3.5 align-middle">
            <p className="text-sm font-semibold text-text-primary truncate" title={voice.name}>
              {voice.name}
            </p>
          </td>
          <td className="px-4 py-3.5 align-middle text-xs text-text-secondary max-w-sm">
            {voice.description ? (
              <p className="line-clamp-2 leading-relaxed" title={voice.description}>
                {voice.description}
              </p>
            ) : (
              <span className="italic text-text-muted">Chưa có mô tả</span>
            )}
          </td>
          <td className="px-4 py-3.5 align-middle text-center">
            {voice.exampleAudio ? (
              <VoicePlayButton isActive={isActive} isPlaying={isPlaying} onClick={() => onTogglePlay(voice)} />
            ) : (
              <span className="text-xs text-text-muted italic">Chưa có file</span>
            )}
          </td>
          <td className="px-4 py-3.5 align-middle text-right pr-5">
            <button
              type="button"
              onClick={(e) => onOpenMenu(e, voice)}
              className="p-1.5 text-text-muted hover:text-text-primary hover:bg-bg rounded-lg transition-colors cursor-pointer"
              aria-label="Mở menu thao tác"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </td>
        </tr>
      );
    });
  };

  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-bg/95 backdrop-blur-sm z-10 border-b border-border">
        <tr className="text-text-secondary text-xs font-semibold uppercase tracking-wider">
          <th className="text-center px-4 py-3.5 w-14 font-mono">#</th>
          <th onClick={() => onSort('name')} className="text-left px-4 py-3.5 cursor-pointer select-none group w-56">
            <span className="inline-flex items-center">
              Tên giọng
              <SortIndicator active={sortField === 'name'} dir={sortDir} />
            </span>
          </th>
          <th className="text-left px-4 py-3.5 w-72">Mô tả</th>
          <th className="text-center px-4 py-3.5 w-48">Mẫu audio</th>
          <th className="text-right px-4 py-3.5 w-20 pr-5">Thao tác</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border-light">{renderBody()}</tbody>
    </table>
  );
});
