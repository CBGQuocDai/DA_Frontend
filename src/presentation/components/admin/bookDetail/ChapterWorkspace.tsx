import React, { useRef, useState } from 'react';
import { Button, Spinner, showConfirm } from '@/src/presentation/components/common';
import type { ChapterWorkspaceProps } from '../../../../shared/types/ChapterWorkspace.types';
import { getChapterStatusBadge } from '@/src/presentation/utils/admin';
import { resolveMediaUrl } from '@/src/shared/utils';
import {
  BookOpen,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Check,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { ChapterTextEditor, type ChapterTextEditorHandle } from './chapterEditor/ChapterTextEditor';
import { AudioPopover } from './AudioPopover';
import type { Chapter } from '@/src/shared/types';

interface ChapterStepButtonProps {
  chapter: Chapter | null;
  direction: 'prev' | 'next';
  onSelect: (id: number) => void;
}

const ChapterStepButton: React.FC<ChapterStepButtonProps> = ({ chapter, direction, onSelect }) => {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  const label = chapter ? `Chương ${chapter.chapterOrder}` : direction === 'prev' ? 'Chương trước' : 'Chương sau';
  return (
    <button
      type="button"
      onClick={() => chapter && onSelect(chapter.id)}
      disabled={!chapter}
      title={label}
      aria-label={label}
      className="p-0.5 rounded-md text-text-secondary hover:bg-bg hover:text-text-primary transition-colors flex-shrink-0 disabled:opacity-40 disabled:pointer-events-none"
    >
      <Icon className="w-4 h-4" />
    </button>
  );
};

export const ChapterWorkspace: React.FC<ChapterWorkspaceProps> = ({
  activeChapter,
  sortedChapters,
  activeChapterIndex,
  voiceName,
  textDraft,
  contentDraft,
  savedContent,
  textVersion,
  isSavingText,
  hasUnsavedChanges,
  audioSpeed,
  isCurrentProcessing,
  isCurrentGenerating,
  isCurrentUploading,
  isSidebarOpen = true,
  onToggleSidebar,
  onEditInfo,
  onGenerateVoice,
  onAudioSpeedChange,
  onUploadAudio,
  onDeleteChapter,
  onDraftChange,
  onSaveText,
  onSelectChapter,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const editorRef = useRef<ChapterTextEditorHandle>(null);
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
            Bắt đầu bằng cách bấm nút &quot;Thêm chương&quot; để thêm chương đầu tiên cho cuốn sách.
          </p>
        </div>
      </div>
    );
  }

  const discardChanges = async () => {
    const confirmed = await showConfirm({
      title: 'Bỏ thay đổi chưa lưu?',
      message: 'Nội dung của chương này sẽ trở về bản đã lưu gần nhất.',
      confirmText: 'Bỏ thay đổi',
      cancelText: 'Tiếp tục sửa',
    });
    if (!confirmed) return;
    const savedText = activeChapter.rawText || '';
    editorRef.current?.resetContent(savedText, savedContent);
    onDraftChange(savedText, savedContent);
  };

  const saveIfDirty = () => {
    if (hasUnsavedChanges && !isSavingText) onSaveText();
  };

  return (
    <div
      className={`@container bg-surface border border-border shadow-sm flex flex-col min-h-0 overflow-hidden ${isFullscreen ? 'fixed inset-0 z-40' : 'rounded-xl sm:rounded-2xl h-full'
        }`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 px-3 py-1.5 border-b border-border flex-shrink-0">
        {/* Wide enough for the number, title and status, so the actions wrap before the status clips */}
        <div className="flex items-center gap-2 flex-1 min-w-[min(20rem,100%)] overflow-hidden">
          {onToggleSidebar && !isFullscreen && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden lg:flex p-1.5 text-text-secondary hover:text-text-primary hover:bg-bg rounded-md transition-colors flex-shrink-0"
              title={isSidebarOpen ? 'Thu gọn danh sách chương để có thêm chỗ' : 'Hiện danh sách chương'}
            >
              {isSidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </button>
          )}
          <span className="w-8 h-8 bg-accent/10 text-accent font-bold rounded-lg flex items-center justify-center text-sm flex-shrink-0">
            {activeChapter.chapterOrder}
          </span>
          <h2
            className="min-w-0 text-sm font-bold text-text-primary tracking-tight truncate"
            title={activeChapter.title || undefined}
          >
            {activeChapter.title || `Chương ${activeChapter.chapterOrder}`}
          </h2>
          <button
            type="button"
            onClick={onEditInfo}
            className="-ml-1 p-0.5 text-text-muted hover:text-accent rounded transition-colors flex-shrink-0"
            title="Đổi tiêu đề hoặc thứ tự chương"
            aria-label="Đổi tiêu đề hoặc thứ tự chương"
          >
            <Pencil className="w-3 h-3" />
          </button>
          {activeChapter.status && (
            <span className="whitespace-nowrap flex-shrink-0">{getChapterStatusBadge(activeChapter.status)}</span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className={`hidden @xl:inline-flex items-center gap-1.5 text-[11px] font-medium ${hasUnsavedChanges ? 'text-warning' : 'text-text-muted'}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${hasUnsavedChanges ? 'bg-warning' : 'bg-success'}`} />
            {hasUnsavedChanges ? 'Chưa lưu' : 'Đã lưu'}
          </span>
          {hasUnsavedChanges && (
            <Button type="button" variant="secondary" size="sm" onClick={discardChanges} disabled={isSavingText}>
              Hủy
            </Button>
          )}
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={saveIfDirty}
            disabled={isSavingText || !hasUnsavedChanges}
            className="text-xs shadow-sm"
            title="Lưu nội dung (Ctrl+S)"
          >
            {isSavingText ? (
              <>
                <Spinner className="w-3.5 h-3.5" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Lưu</span>
              </>
            )}
          </Button>
        </div>

        {!isFullscreen && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <AudioPopover
              rawText={activeChapter.rawText}
              hasAudio={!!activeChapter.audioUrl}
              hasUnsavedChanges={hasUnsavedChanges}
              voiceName={voiceName}
              speed={audioSpeed}
              isProcessing={isCurrentProcessing}
              isGenerating={isCurrentGenerating}
              isUploading={isCurrentUploading}
              onSpeedChange={onAudioSpeedChange}
              onGenerate={(speed) => onGenerateVoice(activeChapter.id, speed)}
              onUpload={() => onUploadAudio(activeChapter.id)}
            />

            <button
              type="button"
              onClick={onDeleteChapter}
              className="p-2 rounded-md text-error border border-error/20 hover:bg-error-light transition-colors"
              title="Xóa chương này"
              aria-label="Xóa chương này"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        <ChapterTextEditor
          key={`${activeChapter.id}-${textVersion}`}
          handleRef={editorRef}
          initialText={textDraft}
          initialContent={contentDraft}
          isFullscreen={isFullscreen}
          onChange={onDraftChange}
          onSave={saveIfDirty}
          onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
          statusBarAudio={
            activeChapter.audioUrl && (
              <audio
                controls
                src={resolveMediaUrl(activeChapter.audioUrl)}
                className="order-first w-full h-7 @4xl:order-none @4xl:w-auto @4xl:flex-1 @4xl:min-w-0"
                preload="metadata"
                aria-label="Audio của chương"
              />
            )
          }
          statusBarEnd={
            !isFullscreen &&
            activeChapterIndex >= 0 && (
              <span className="inline-flex items-center gap-1">
                <ChapterStepButton chapter={prevChapter} direction="prev" onSelect={onSelectChapter} />
                <span className="text-text-muted whitespace-nowrap">
                  Chương {activeChapterIndex + 1}/{sortedChapters.length}
                </span>
                <ChapterStepButton chapter={nextChapter} direction="next" onSelect={onSelectChapter} />
              </span>
            )
          }
        />
      </div>
    </div>
  );
};
