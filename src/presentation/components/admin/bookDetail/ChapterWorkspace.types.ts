import type { Chapter } from '@/src/shared/types';
import type { FontSize } from '@/src/presentation/hooks/admin';

export interface ChapterWorkspaceProps {
  activeChapter: Chapter | null;
  sortedChapters: Chapter[];
  activeChapterIndex: number;
  isEditingText: boolean;
  textDraft: string;
  fontSize: FontSize;
  isSavingText: boolean;
  isCurrentProcessing: boolean;
  isCurrentGenerating: boolean;
  isCurrentUploading: boolean;
  copyFeedback: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onEditInfo: () => void;
  onGenerateVoice: (chapterId: number) => void;
  onUploadAudio: (chapterId: number) => void;
  onDeleteChapter: () => void;
  onSetEditingText: (value: boolean) => void;
  onTextDraftChange: (value: string) => void;
  onSaveText: () => void;
  onCopyText: () => void;
  onSetFontSize: (size: FontSize) => void;
  onSelectChapter: (chapterId: number) => void;
}
