import type { Chapter } from '@/src/shared/types';

export interface ChapterWorkspaceProps {
  bookId: number;
  activeChapter: Chapter | null;
  sortedChapters: Chapter[];
  activeChapterIndex: number;
  voiceName?: string;
  contentDraft: string;
  /** Tài liệu đã lưu của chương đang mở; rỗng nếu chương chưa có nội dung */
  savedContent: string;
  /** Thay đổi khi trình soạn thảo cần nạp lại `contentDraft` */
  textVersion: number;
  isSavingText: boolean;
  hasUnsavedChanges: boolean;
  /** Tốc độ đọc backend đang lưu cho chương đang mở */
  audioSpeed?: number | null;
  isCurrentProcessing: boolean;
  isCurrentGenerating: boolean;
  isCurrentUploading: boolean;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  onEditInfo: () => void;
  onGenerateVoice: (chapterId: number, speed: number) => void;
  onUploadAudio: (chapterId: number) => void;
  onDeleteChapter: () => void;
  onDraftChange: (content: string) => void;
  onSaveText: () => void;
  onSelectChapter: (chapterId: number) => void;
}
