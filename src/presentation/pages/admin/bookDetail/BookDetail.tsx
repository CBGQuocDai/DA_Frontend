'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AdminLayout } from '@/src/presentation/layouts';
import { ConfirmDeleteModal } from '@/src/presentation/components/common';
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
import { ROUTES } from '@/src/shared/constants';
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
    reload,
    onChapterCreated: () => setMobileTab('detail'),
  });
  const search = useChapterSearch(sortedChapters);

  if (data.isLoading) {
    return (
      <AdminLayout>
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
    <AdminLayout>
      <div className="h-full flex flex-col min-h-0 space-y-3 sm:space-y-3.5">
        <div className="flex items-center justify-between flex-shrink-0">
          <Link
            href={ROUTES.ADMIN.MANAGE_BOOK}
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Quay lại danh sách</span>
          </Link>
          <span className="text-xs text-text-muted font-mono">Book ID: #{book.id}</span>
        </div>

        <BookHeader
          book={book}
          chapters={chapters}
          actionLoading={bookActions.actionLoading}
          onOpenEditBook={bookActions.edit.open}
          onPublish={bookActions.publish}
          onUnpublish={bookActions.unpublish}
        />

        <MobileTabSwitcher value={mobileTab} chapterCount={chapters.length} onChange={setMobileTab} />

        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 lg:gap-4.5 min-h-[420px]">
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
              onSelectChapter={(id) => {
                setSelectedChapterId(id);
                setMobileTab('detail');
              }}
              onAddChapter={chapterActions.addModal.open}
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
              isEditingText={editor.isEditingText}
              textDraft={editor.textDraft}
              fontSize={editor.fontSize}
              isSavingText={editor.isSavingText}
              isCurrentProcessing={activeChapter?.status === 'PROCESSING_AUDIO'}
              isCurrentGenerating={
                !!activeChapter && chapterActions.generatingChapterId === activeChapter.id
              }
              isCurrentUploading={
                !!activeChapter && chapterActions.uploadingChapterId === activeChapter.id
              }
              copyFeedback={editor.copyFeedback}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onEditInfo={chapterActions.editModal.open}
              onGenerateVoice={chapterActions.generateVoice}
              onUploadAudio={chapterActions.triggerUpload}
              onDeleteChapter={chapterActions.deleteModal.open}
              onSetEditingText={editor.setIsEditingText}
              onTextDraftChange={editor.setTextDraft}
              onSaveText={editor.saveText}
              onCopyText={editor.copyText}
              onSetFontSize={editor.setFontSize}
              onSelectChapter={(id) => {
                setSelectedChapterId(id);
                editor.setIsEditingText(false);
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
          onSuccess={chapterActions.handleEditSuccess}
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
