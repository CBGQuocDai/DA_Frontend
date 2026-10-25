import type { ChapterStatus } from '@/src/shared/types';
import { Badge } from '@/src/presentation/components/ui';

export const chapterStatusConfig: Record<
  ChapterStatus,
  { label: string; variant: 'default' | 'primary' | 'success' | 'warning' | 'error' }
> = {
  PENDING_TEXT: { label: 'Chờ text', variant: 'default' },
  TEXT_READY: { label: 'Text sẵn sàng', variant: 'primary' },
  PROCESSING_AUDIO: { label: 'Đang tạo audio', variant: 'warning' },
  AUDIO_READY: { label: 'Audio sẵn sàng', variant: 'success' },
};

export function getChapterStatusBadge(status: ChapterStatus | string | undefined) {
  const key = (status ?? 'PENDING_TEXT') as ChapterStatus;
  const config = chapterStatusConfig[key] ?? { label: key, variant: 'default' as const };
  return <Badge variant={config.variant} className="text-xs">{config.label}</Badge>;
}
