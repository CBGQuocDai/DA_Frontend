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

/** Trang chi tiết sách của admin: thông tin sách, danh sách chương và khu soạn nội dung/audio từng chương. */
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

  // Cảnh báo trước khi đóng tab nếu nội dung chương còn thay đổi chưa lưu
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
            className={`w-full lg:w-[350px] xl:w-[380px] 2xl:w-[410px] lg:flex-shrink-0 flex flex-col h-full min-h-0 ${!isSidebarOpen ? 'lg:hidden' : ''
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
                // Tạo chương mới sẽ chuyển sang chương đó và làm mất bản nháp hiện tại
                if (await confirmDiscardEdits()) chapterActions.addModal.open();
              }}
              onMergeChapters={async (selected) => {
                const confirmed = await showConfirm({
                  title: `Gộp ${selected.length} chương?`,
                  message: `Bạn có chắc chắn muốn gộp ${selected.length} chương đã chọn không?`,
                  confirmText: 'Gộp chương',
                });
                // Sau khi gộp sẽ mở chương đã gộp nên bản nháp hiện tại không còn dùng được
                if (!confirmed || !(await confirmDiscardEdits())) return false;
                if (hasUnsavedChanges) editor.discardDraft();
                const merged = await chapterActions.mergeChapters(selected.map((chapter) => chapter.id));
                if (merged) setMobileTab('detail');
                return merged;
              }}
            />
          </div>

          <div
            className={`flex-1 min-w-0 flex flex-col h-full min-h-0 ${mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
              }`}
          >
            <ChapterWorkspace
              bookId={bookId}
              activeChapter={activeChapter}
              sortedChapters={sortedChapters}
              activeChapterIndex={activeChapterIndex}
              voiceName={book.voice?.name}
              contentDraft={editor.contentDraft}
              savedContent={editor.savedContent}
              textVersion={editor.textVersion}
              isSavingText={editor.isSavingText}
              hasUnsavedChanges={hasUnsavedChanges}
              audioSpeed={activeChapter?.readingSpeed}
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
              onUploadAudio={chapterActions.pickAudioFile}
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
