'use client';

import React, { useEffect, useState } from 'react';
import { AdminLayout } from '@/src/presentation/layouts';
import { ConfirmDeleteModal, showConfirm } from '@/src/presentation/components/common';
import { BookFormModal } from '@/src/presentation/components/admin/book';
import {
  BookHeader,
  ChapterList,
  ChapterWorkspace,
  AddChapterModal,
  EditChapterModal,
  BookDetailSkeleton,
  BookNotFound,
  MobileTabSwitcher,
  type MobileTab,
} from '@/src/presentation/components/admin/bookDetail';
import {
  useBookDetailData,
  useBookActions,
  useChapterEditor,
  useChapterActions,
  useChapterSearch,
} from '@/src/presentation/hooks/admin';

interface BookDetailProps {
  bookId: number;
}

export const BookDetail: React.FC<BookDetailProps> = ({ bookId }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<MobileTab>('detail');

  const data = useBookDetailData(bookId);
  const {
    book,
    chapters,
    setChapters,
    sortedChapters,
    selectedChapterId,
    setSelectedChapterId,
    activeChapter,
    activeChapterIndex,
    nextChapterOrder,
    loadData,
  } = data;

  const reload = () => loadData();
  const bookActions = useBookActions({ book, setBook: data.setBook, reload });
  const editor = useChapterEditor({ bookId, activeChapter, setChapters });
  const chapterActions = useChapterActions({
    bookId,
    chapters,
    activeChapter,
    setChapters,
    setSelectedChapterId,
    onChapterCreated: () => setMobileTab('detail'),
  });
  const search = useChapterSearch(sortedChapters);

  // Warn before closing the tab while the chapter text has unsaved edits
  const { hasUnsavedChanges } = editor;
  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [hasUnsavedChanges]);

  const confirmDiscardEdits = async () =>
    !hasUnsavedChanges ||
    showConfirm({
      title: 'Bỏ thay đổi chưa lưu?',
      message: 'Chương hiện tại có thay đổi chưa lưu. Nếu tiếp tục, các thay đổi này sẽ bị mất.',
      confirmText: 'Bỏ thay đổi',
      cancelText: 'Tiếp tục sửa',
    });

  if (data.isLoading) {
    return (
      <AdminLayout compact>
        <BookDetailSkeleton />
      </AdminLayout>
    );
  }

  if (!book) {
    return (
      <AdminLayout>
        <BookNotFound bookId={bookId} />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout compact>
      <div className="h-full flex flex-col min-h-0 space-y-2">
        <BookHeader
          book={book}
          actionLoading={bookActions.actionLoading}
          onOpenEditBook={bookActions.edit.open}
          onPublish={bookActions.publish}
          onUnpublish={bookActions.unpublish}
        />

        <MobileTabSwitcher value={mobileTab} chapterCount={chapters.length} onChange={setMobileTab} />

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2 lg:gap-3 min-h-[420px]">
          <div
            className={`w-full lg:w-[350px] xl:w-[380px] 2xl:w-[410px] lg:flex-shrink-0 flex flex-col h-full min-h-0 ${
              !isSidebarOpen ? 'lg:hidden' : ''
            } ${mobileTab === 'detail' ? 'hidden lg:flex' : 'flex'}`}
          >
            <ChapterList
              chapters={chapters}
              selectedChapterId={selectedChapterId}
              filteredChapters={search.filtered}
              chapterSearch={search.query}
              onSearchChange={search.setQuery}
              onSelectChapter={async (id) => {
                if (id !== selectedChapterId && !(await confirmDiscardEdits())) return;
                setSelectedChapterId(id);
                setMobileTab('detail');
              }}
              onAddChapter={async () => {
                // Creating a chapter switches to it, which drops the current draft
                if (await confirmDiscardEdits()) chapterActions.addModal.open();
              }}
            />
          </div>

          <div
            className={`flex-1 min-w-0 flex flex-col h-full min-h-0 ${
              mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <ChapterWorkspace
              activeChapter={activeChapter}
              sortedChapters={sortedChapters}
              activeChapterIndex={activeChapterIndex}
              voiceName={book.voice?.name}
              textDraft={editor.textDraft}
              contentDraft={editor.contentDraft}
              savedContent={editor.savedContent}
              textVersion={editor.textVersion}
              isSavingText={editor.isSavingText}
              hasUnsavedChanges={hasUnsavedChanges}
              audioSpeed={chapterActions.audioSpeed}
              isCurrentProcessing={activeChapter?.status === 'PROCESSING_AUDIO'}
              isCurrentGenerating={
                !!activeChapter && chapterActions.generatingChapterId === activeChapter.id
              }
              isCurrentUploading={
                !!activeChapter && chapterActions.uploadingChapterId === activeChapter.id
              }
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onEditInfo={chapterActions.editModal.open}
              onGenerateVoice={chapterActions.generateVoice}
              onAudioSpeedChange={chapterActions.setAudioSpeed}
              onUploadAudio={chapterActions.triggerUpload}
              onDeleteChapter={chapterActions.deleteModal.open}
              onDraftChange={editor.updateDraft}
              onSaveText={editor.saveText}
              onSelectChapter={async (id) => {
                if (!(await confirmDiscardEdits())) return;
                setSelectedChapterId(id);
              }}
            />
          </div>
        </div>
      </div>

      {bookActions.edit.isOpen && (
        <BookFormModal
          mode="edit"
          book={book}
          categories={bookActions.edit.categories}
          authors={bookActions.edit.authors}
          voices={bookActions.edit.voices}
          onClose={bookActions.edit.close}
          onSubmit={bookActions.edit.save}
        />
      )}

      {chapterActions.addModal.isOpen && (
        <AddChapterModal
          onClose={chapterActions.addModal.close}
          defaultChapterOrder={nextChapterOrder}
          onSubmit={chapterActions.createChapter}
        />
      )}

      {chapterActions.editModal.isOpen && activeChapter && (
        <EditChapterModal
          bookId={bookId}
          onClose={chapterActions.editModal.close}
          chapter={activeChapter}
          onSuccess={chapterActions.reloadChapters}
        />
      )}

      <ConfirmDeleteModal
        isOpen={chapterActions.deleteModal.isOpen}
        onClose={chapterActions.deleteModal.close}
        onConfirm={chapterActions.deleteModal.confirm}
        title="Xóa chương"
        itemName={activeChapter?.title || `Chương ${activeChapter?.chapterOrder ?? ''}`}
        isLoading={chapterActions.deleteModal.isDeleting}
      />
    </AdminLayout>
  );
};
