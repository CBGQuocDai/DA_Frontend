import type { Chapter } from '@/src/shared/types';

export interface ChapterWorkspaceProps {
  activeChapter: Chapter | null;
  sortedChapters: Chapter[];
  activeChapterIndex: number;
  isEditingText: boolean;
  textDraft: string;
  fontSize: 'sm' | 'base' | 'lg';
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
  onSetFontSize: (size: 'sm' | 'base' | 'lg') => void;
  onSelectChapter: (chapterId: number) => void;
}
