import React from 'react';
import { Button } from '@/src/presentation/components/ui';
import type { Chapter } from '@/src/shared/types';
import { getChapterStatusBadge } from '@/src/presentation/utils/chapterStatus';
import {
  BookOpen,
  Pencil,
  Sparkles,
  Upload,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Volume2,
  Copy,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface ChapterWorkspaceProps {
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

const resolveAudioUrl = (url?: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8083/api').replace(
    /\/api\/?$/,
    ''
  );
  return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
};

const getWordCount = (text?: string) => {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const formatDuration = (seconds?: number | null) => {
  if (!seconds && seconds !== 0) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

export const ChapterWorkspace: React.FC<ChapterWorkspaceProps> = ({
  activeChapter,
  sortedChapters,
  activeChapterIndex,
  isEditingText,
  textDraft,
  fontSize,
  isSavingText,
  isCurrentProcessing,
  isCurrentGenerating,
  isCurrentUploading,
  copyFeedback,
  isSidebarOpen = true,
  onToggleSidebar,
  onEditInfo,
  onGenerateVoice,
  onUploadAudio,
  onDeleteChapter,
  onSetEditingText,
  onTextDraftChange,
  onSaveText,
  onCopyText,
  onSetFontSize,
  onSelectChapter,
}) => {
  const prevChapter = activeChapterIndex > 0 ? sortedChapters[activeChapterIndex - 1] : null;
  const nextChapter =
    activeChapterIndex >= 0 && activeChapterIndex < sortedChapters.length - 1
      ? sortedChapters[activeChapterIndex + 1]
      : null;

  if (!activeChapter) {
    return (
      <div className="bg-surface rounded-xl sm:rounded-2xl border border-border p-4 sm:p-5 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
        <div className="py-28 text-center space-y-3">
          <div className="w-14 h-14 bg-bg rounded-full flex items-center justify-center mx-auto text-text-muted">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-text-primary">Chưa có chương nào được tạo</h3>
          <p className="text-xs text-text-secondary max-w-sm mx-auto">
            Bắt đầu bằng cách bấm nút "Thêm chương" để thêm chương đầu tiên cho cuốn sách.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-xl sm:rounded-2xl border border-border p-4 sm:p-5 shadow-sm flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="pb-3 border-b border-border space-y-3 flex-shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {onToggleSidebar && (
              <button
                type="button"
                onClick={onToggleSidebar}
                className="hidden lg:flex p-2 text-text-secondary hover:text-text-primary hover:bg-bg rounded-lg border border-border transition-colors flex-shrink-0"
                title={isSidebarOpen ? 'Thu gọn danh sách chương để đọc rộng hơn' : 'Hiện danh sách chương'}
              >
                {isSidebarOpen ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>
            )}
            <span className="w-10 h-10 bg-accent/10 text-accent font-bold rounded-xl flex items-center justify-center text-base flex-shrink-0">
              {activeChapter.chapterOrder}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight truncate">
                  {activeChapter.title || `Chương ${activeChapter.chapterOrder}`}
                </h2>
                <button
                  type="button"
                  onClick={onEditInfo}
                  className="p-1 text-text-muted hover:text-accent rounded transition-colors"
                  title="Đổi tiêu đề hoặc thứ tự chương"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-text-muted flex-wrap">
                <span className="font-medium text-text-primary">
                  {getWordCount(activeChapter.rawText).toLocaleString()} từ
                </span>
                <span>•</span>
                <span>{activeChapter.rawText?.length.toLocaleString() || 0} ký tự</span>
                {activeChapter.duration && (
                  <>
                    <span>•</span>
                    <span>Thời lượng: {formatDuration(activeChapter.duration)}</span>
                  </>
                )}
                <span>•</span>
                {getChapterStatusBadge(activeChapter.status)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onGenerateVoice(activeChapter.id)}
              disabled={isCurrentProcessing || isCurrentGenerating || isCurrentUploading}
              className="text-xs shadow-sm"
              title="Tạo giọng đọc AI từ nội dung văn bản này"
            >
              {isCurrentGenerating || isCurrentProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isCurrentGenerating ? 'Đang gửi...' : 'Đang tạo audio...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>gen audio</span>
                </>
              )}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUploadAudio(activeChapter.id)}
              disabled={isCurrentUploading || isCurrentGenerating}
              className="text-xs"
              title="Tải lên file âm thanh cho chương này"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload audio</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onDeleteChapter}
              className="text-xs text-error hover:bg-error-light hover:text-error border border-error/20"
              title="Xóa chương này"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </Button>
          </div>
        </div>

        {/* Audio Player */}
        <div className="p-3 bg-bg rounded-xl border border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex-1 w-full">
            {activeChapter.audioUrl ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-text-muted mb-1">
                  <span className="font-medium text-text-primary flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    Audio phát chính thức
                  </span>
                  {activeChapter.duration && <span>{formatDuration(activeChapter.duration)}</span>}
                </div>
                <audio
                  key={activeChapter.id}
                  controls
                  src={resolveAudioUrl(activeChapter.audioUrl)}
                  className="w-full h-9 rounded"
                  preload="metadata"
                />
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-text-muted py-1 italic">
                <Volume2 className="w-4 h-4 text-text-muted" />
                <span>
                  Chương này chưa có file âm thanh. Bấm "gen audio" để AI tạo tự động hoặc
                  "Upload audio" để tải lên.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2 py-2 flex-shrink-0">
        <div className="flex items-center border border-border rounded-lg p-0.5 bg-bg">
          <button
            type="button"
            onClick={() => onSetEditingText(false)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              !isEditingText
                ? 'bg-surface text-accent shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Đọc văn bản</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onTextDraftChange(activeChapter.rawText || '');
              onSetEditingText(true);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              isEditingText
                ? 'bg-surface text-accent shadow-sm'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Chỉnh sửa text</span>
          </button>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditingText ? (
            <>
              <div className="flex items-center border border-border rounded-lg overflow-hidden bg-bg text-xs">
                <button
                  type="button"
                  onClick={() => onSetFontSize('sm')}
                  className={`px-2 py-1 transition-colors ${
                    fontSize === 'sm' ? 'bg-accent text-white font-bold' : 'text-text-secondary hover:bg-surface'
                  }`}
                  title="Cỡ chữ nhỏ"
                >
                  A-
                </button>
                <button
                  type="button"
                  onClick={() => onSetFontSize('base')}
                  className={`px-2.5 py-1 transition-colors ${
                    fontSize === 'base' ? 'bg-accent text-white font-bold' : 'text-text-secondary hover:bg-surface'
                  }`}
                  title="Cỡ chữ chuẩn"
                >
                  A
                </button>
                <button
                  type="button"
                  onClick={() => onSetFontSize('lg')}
                  className={`px-2 py-1 transition-colors ${
                    fontSize === 'lg' ? 'bg-accent text-white font-bold' : 'text-text-secondary hover:bg-surface'
                  }`}
                  title="Cỡ chữ lớn"
                >
                  A+
                </button>
              </div>
              <Button type="button" variant="secondary" size="sm" onClick={onCopyText} className="text-xs">
                {copyFeedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-success" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  onTextDraftChange(activeChapter.rawText || '');
                  onSetEditingText(false);
                }}
                className="text-xs"
              >
                Hủy bỏ
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={onSaveText} disabled={isSavingText} className="text-xs shadow-sm">
                {isSavingText ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Lưu nội dung</span>
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-bg/40 rounded-xl border border-border/70 p-4 sm:p-6 lg:p-7">
        {isEditingText ? (
          <div className="space-y-3 h-full flex flex-col">
            <div className="flex items-center justify-between text-xs text-text-muted flex-shrink-0">
              <span>Đang chỉnh sửa nội dung văn bản</span>
              <span>
                {getWordCount(textDraft).toLocaleString()} từ • {textDraft.length.toLocaleString()} ký tự
              </span>
            </div>
            <textarea
              value={textDraft}
              onChange={(e) => onTextDraftChange(e.target.value)}
              placeholder="Nhập hoặc dán nội dung chữ của chương..."
              className="w-full flex-1 min-h-[320px] p-4 bg-surface border border-accent/40 rounded-xl text-base leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent/20 font-sans shadow-sm"
              autoFocus
            />
            <div className="flex justify-between items-center text-xs text-text-muted pt-1 flex-shrink-0">
              <span>Mẹo: Bạn có thể dán nội dung hàng nghìn từ từ file Word hoặc PDF.</span>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => onSetEditingText(false)}>
                  Hủy
                </Button>
                <Button size="sm" variant="primary" onClick={onSaveText} disabled={isSavingText}>
                  {isSavingText ? 'Đang lưu...' : 'Lưu nội dung'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full">
            {activeChapter.rawText ? (
              <article
                className={`w-full text-text-primary space-y-4 font-sans ${
                  fontSize === 'sm'
                    ? 'text-sm leading-7'
                    : fontSize === 'lg'
                    ? 'text-lg leading-9'
                    : 'text-base leading-8'
                }`}
              >
                {activeChapter.rawText
                  .split(/\n+/)
                  .filter((para) => para.trim().length > 0)
                  .map((paragraph, idx) => (
                    <p key={idx} className="text-justify indent-6">
                      {paragraph.trim()}
                    </p>
                  ))}
              </article>
            ) : (
              <div className="py-20 text-center space-y-3">
                <div className="w-12 h-12 bg-surface rounded-full flex items-center justify-center mx-auto text-text-muted">
                  <BookOpen className="w-6 h-6" />
                </div>
                <p className="text-base font-semibold text-text-primary">
                  Chương này chưa có nội dung văn bản
                </p>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Bấm "Chỉnh sửa text" ở trên để nhập hoặc dán nội dung chữ cho chương này.
                </p>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    onTextDraftChange('');
                    onSetEditingText(true);
                  }}
                >
                  + Nhập nội dung text ngay
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-secondary flex-shrink-0">
        <button
          type="button"
          onClick={() => prevChapter && onSelectChapter(prevChapter.id)}
          disabled={!prevChapter}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            prevChapter
              ? 'hover:bg-bg hover:text-text-primary text-text-secondary border border-border bg-surface'
              : 'opacity-40 cursor-not-allowed border border-transparent'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{prevChapter ? `Chương ${prevChapter.chapterOrder}` : 'Chương trước'}</span>
        </button>

        <span className="font-mono text-text-muted">
          {activeChapterIndex >= 0 ? `${activeChapterIndex + 1} / ${sortedChapters.length}` : ''}
        </span>

        <button
          type="button"
          onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
          disabled={!nextChapter}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            nextChapter
              ? 'hover:bg-bg hover:text-text-primary text-text-secondary border border-border bg-surface'
              : 'opacity-40 cursor-not-allowed border border-transparent'
          }`}
        >
          <span>{nextChapter ? `Chương ${nextChapter.chapterOrder}` : 'Chương sau'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ChapterWorkspace;
