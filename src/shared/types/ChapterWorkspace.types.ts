import type { Chapter } from '@/src/shared/types';

export interface ChapterWorkspaceProps {
  activeChapter: Chapter | null;
  sortedChapters: Chapter[];
  activeChapterIndex: number;
  voiceName?: string;
  textDraft: string;
  contentDraft: string;
  /** Stored formatting of the active chapter, empty if none or stale */
  savedContent: string;
  /** Changes when the editor must reload `textDraft` */
  textVersion: number;
  isSavingText: boolean;
  hasUnsavedChanges: boolean;
  audioSpeed: number;
  isCurrentProcessing: boolean;
  isCurrentGenerating: boolean;
  isCurrentUploading: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onEditInfo: () => void;
  onGenerateVoice: (chapterId: number, speed: number) => void;
  onAudioSpeedChange: (speed: number) => void;
  onUploadAudio: (chapterId: number) => void;
  onDeleteChapter: () => void;
  onDraftChange: (text: string, content: string) => void;
  onSaveText: () => void;
  onSelectChapter: (chapterId: number) => void;
}
