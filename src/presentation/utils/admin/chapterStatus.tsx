import type { ChapterStatus } from '@/src/shared/types';
import { Badge, type BadgeVariant } from '@/src/presentation/components/common';

const chapterStatusConfig: Record<ChapterStatus, { label: string; variant: BadgeVariant }> = {
  FAILED: { label: 'Tạo audio thất bại', variant: 'error' },
  PROCESSING_AUDIO: { label: 'Đang tạo audio', variant: 'warning' },
  AUDIO_READY: { label: 'Audio sẵn sàng', variant: 'success' },
};

export function getChapterStatusBadge(status: ChapterStatus | string | undefined) {
  const key = (status ?? '') as ChapterStatus;
  const config = chapterStatusConfig[key] ?? { label: key, variant: 'default' as const };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
}
