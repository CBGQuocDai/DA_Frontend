'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { AdminLayout } from '@/src/presentation/layouts';
import {
  bookService,
  chapterService,
  categoryService,
  authorService,
  voiceService,
} from '@/src/infrastructure/api/services';
import type { Book, Chapter, ChapterStatus, Category, Author, Voice } from '@/src/shared/types';
import { Button } from '@/src/presentation/components/ui';
import { EditChapterModal } from '@/src/presentation/components/admin/EditChapterModal';
import {
  BookHeader,
  ChapterList,
  ChapterWorkspace,
  AddChapterModal,
  EditBookModal,
} from '@/src/presentation/components/admin/bookDetail';
import { ROUTES } from '@/src/shared/constants';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';

interface BookDetailProps {
  bookId: number;
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

export const BookDetail: React.FC<BookDetailProps> = ({ bookId }) => {
  // Data states
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Workspace states
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [mobileTab, setMobileTab] = useState<'list' | 'detail'>('detail');
  const [isEditingText, setIsEditingText] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [isSavingText, setIsSavingText] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');

  // Chapter action states
  const [generatingChapterId, setGeneratingChapterId] = useState<number | null>(null);
  const [uploadingChapterId, setUploadingChapterId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Modals
  const [showAddChapterModal, setShowAddChapterModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showEditBookModal, setShowEditBookModal] = useState(false);
  const [isSubmittingBook, setIsSubmittingBook] = useState(false);

  // Options for book edit
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allAuthors, setAllAuthors] = useState<Author[]>([]);
  const [allVoices, setAllVoices] = useState<Voice[]>([]);

  // Sample voice audio player
  const [isVoicePlaying, setIsVoicePlaying] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch book and chapters
  const loadData = useCallback(
    async (isInitial = false) => {
      if (isInitial) setIsLoading(true);
      else setIsRefreshing(true);

      try {
        const [chaptersRes, bookRes] = await Promise.allSettled([
          chapterService.getChapters(bookId),
          bookService.getBookById(bookId),
        ]);

        const chaptersData: Chapter[] =
          chaptersRes.status === 'fulfilled' ? chaptersRes.value ?? [] : [];
        setChapters(chaptersData);

        setSelectedChapterId((prev) => {
          if (prev && chaptersData.some((c) => c.id === prev)) return prev;
          return chaptersData.length > 0 ? chaptersData[0].id : null;
        });

        let bookData: Book | null =
          bookRes.status === 'fulfilled' ? bookRes.value : null;

        if (!bookData && chaptersData.length > 0 && (chaptersData[0] as any).book) {
          bookData = (chaptersData[0] as any).book as Book;
        }

        if (bookData && (!bookData.coverImage || !bookData.coverImage.startsWith('http'))) {
          try {
            const listRes = await bookService.getBooks({ page: 0, size: 100 });
            const found = listRes?.content?.find((b) => b.id === Number(bookId));
            if (found?.coverImage) {
              bookData = { ...bookData, coverImage: found.coverImage };
            }
          } catch {
            // ignore
          }
        }

        setBook(bookData);
      } catch (error) {
        console.error('Error fetching book detail:', error);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [bookId]
  );

  useEffect(() => {
    loadData(true);

    return () => {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current = null;
      }
    };
  }, [loadData]);

  // Selected active chapter
  const activeChapter = chapters.find((c) => c.id === selectedChapterId) || chapters[0] || null;

  // Sync draft text when active chapter changes
  useEffect(() => {
    if (activeChapter) {
      setTextDraft(activeChapter.rawText || '');
      setIsEditingText(false);
    }
  }, [activeChapter?.id]);

  // Polling when any chapter is in PROCESSING_AUDIO
  useEffect(() => {
    const hasProcessing = chapters.some((c) => c.status === 'PROCESSING_AUDIO');
    if (!hasProcessing) return;

    const interval = setInterval(async () => {
      try {
        const updatedChapters = await chapterService.getChapters(bookId);
        setChapters(updatedChapters ?? []);
      } catch (err) {
        console.error('Error polling chapters:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [chapters, bookId]);

  // Handle Play Voice Sample
  const handleToggleVoiceAudio = (audioUrl?: string) => {
    if (!audioUrl) return;
    const resolvedUrl = resolveAudioUrl(audioUrl);

    if (voiceAudioRef.current) {
      if (isVoicePlaying) {
        voiceAudioRef.current.pause();
        setIsVoicePlaying(false);
        return;
      } else {
        voiceAudioRef.current.play();
        setIsVoicePlaying(true);
        return;
      }
    }

    const audio = new Audio(resolvedUrl);
    voiceAudioRef.current = audio;
    audio.play();
    setIsVoicePlaying(true);

    audio.onended = () => setIsVoicePlaying(false);
    audio.onerror = () => {
      setIsVoicePlaying(false);
      alert('Không thể phát âm thanh mẫu của giọng đọc này.');
    };
  };

  // Book actions
  const handlePublish = async () => {
    if (!book) return;
    setActionLoading('publish');
    try {
      await bookService.publishBook(book.id);
      await loadData();
    } catch (error) {
      console.error('Error publishing book:', error);
      alert('Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async () => {
    if (!book) return;
    setActionLoading('unpublish');
    try {
      await bookService.unpublishBook(book.id);
      await loadData();
    } catch (error) {
      console.error('Error unpublishing book:', error);
      alert('Có lỗi xảy ra khi gỡ sách.');
    } finally {
      setActionLoading(null);
    }
  };

  // Book Edit Modal
  const openEditBookModal = async () => {
    if (!book) return;
    try {
      const [cats, auths, voices] = await Promise.all([
        categoryService.getCategories(),
        authorService.getAuthors(),
        voiceService.getVoices(),
      ]);
      setAllCategories(cats ?? []);
      setAllAuthors(auths ?? []);
      const voicesList = (voices as any)?.content ?? (Array.isArray(voices) ? voices : []);
      setAllVoices(voicesList);
    } catch (err) {
      console.error('Error fetching options for book edit:', err);
    }
    setShowEditBookModal(true);
  };

  const handleSaveBookEdit = async (data: {
    title: string;
    description: string;
    price: number;
    voiceId: number;
    categoryIds: number[];
    authorIds: number[];
    coverFile?: File | null;
  }) => {
    if (!book) return;

    setIsSubmittingBook(true);
    try {
      const form = new FormData();
      const bookData = {
        title: data.title,
        description: data.description,
        price: data.price,
        voice: data.voiceId ? { id: data.voiceId } : undefined,
        categories: data.categoryIds.map((id) => ({ id })),
        authors: data.authorIds.map((id) => ({ id })),
      };
      form.append('book', new Blob([JSON.stringify(bookData)], { type: 'application/json' }));
      if (data.coverFile) {
        form.append('bookCover', data.coverFile);
      }

      const updated = await bookService.updateBook(book.id, form);
      if (updated) {
        setBook(updated);
      }
      setShowEditBookModal(false);
      await loadData();
    } catch (err) {
      console.error('Error updating book:', err);
      alert('Có lỗi xảy ra khi cập nhật thông tin sách.');
    } finally {
      setIsSubmittingBook(false);
    }
  };

  // Add Chapter
  const openAddChapterModal = () => {
    setShowAddChapterModal(true);
  };

  const handleCreateChapter = async (title: string, chapterOrder: number, rawText: string) => {
    const created = await chapterService.createChapter(bookId, {
      title,
      chapterOrder,
      rawText,
    });

    if (created && created.id) {
      const updatedChapters = await chapterService.getChapters(bookId);
      setChapters(updatedChapters ?? []);
      setSelectedChapterId(created.id);
      setMobileTab('detail');
    } else {
      await loadData();
    }
  };

  // Chapter Edit
  const openEditInfoModal = () => {
    if (!activeChapter) return;
    setShowEditInfoModal(true);
  };

  const handleEditChapterSuccess = (updated: Chapter) => {
    setChapters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
    chapterService.getChapters(bookId).then((refreshed) => {
      if (refreshed) setChapters(refreshed);
    });
  };

  // Chapter Delete
  const handleDeleteActiveChapter = async () => {
    if (!activeChapter) return;
    const confirmDelete = window.confirm(
      `Bạn có chắc chắn muốn xóa "${activeChapter.title || `Chương ${activeChapter.chapterOrder}`}"? Hành động này không thể hoàn tác.`
    );
    if (!confirmDelete) return;

    try {
      await chapterService.deleteChapter(bookId, activeChapter.id);
      const updated = chapters.filter((c) => c.id !== activeChapter.id);
      setChapters(updated);
      setSelectedChapterId(updated.length > 0 ? updated[0].id : null);
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Có lỗi xảy ra khi xóa chương này.');
    }
  };

  // Save Raw Text Changes
  const handleSaveText = async () => {
    if (!activeChapter) return;
    setIsSavingText(true);
    try {
      setChapters((prev) =>
        prev.map((c) =>
          c.id === activeChapter.id
            ? { ...c, rawText: textDraft }
            : c
        )
      );
      setIsEditingText(false);
    } finally {
      setIsSavingText(false);
    }
  };

  // AI Voice Generation
  const handleGenerateVoice = async (chapterId: number) => {
    setGeneratingChapterId(chapterId);
    try {
      await chapterService.generateAudio(bookId, chapterId);
      setChapters((prev) =>
        prev.map((c) =>
          c.id === chapterId ? { ...c, status: 'PROCESSING_AUDIO' as ChapterStatus } : c
        )
      );
    } catch (error) {
      console.error('Error generating voice audio:', error);
      alert('Không thể tạo audio tự động cho chương này. Vui lòng thử lại sau.');
    } finally {
      setGeneratingChapterId(null);
    }
  };

  // Upload Audio file
  const triggerUploadClick = (chapterId: number) => {
    setUploadingChapterId(chapterId);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const chapterId = uploadingChapterId;
    if (!file || !chapterId) return;

    try {
      const updated = await chapterService.getChapters(bookId);
      if (updated && updated.length > 0) {
        setChapters(updated);
      }
    } catch (error) {
      console.error('Error reloading chapters:', error);
    } finally {
      setUploadingChapterId(null);
    }
  };

  const handleCopyText = () => {
    if (!activeChapter?.rawText) return;
    navigator.clipboard.writeText(activeChapter.rawText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  // Sorted & filtered chapters
  const sortedChapters = [...chapters].sort((a, b) => a.chapterOrder - b.chapterOrder);

  const filteredChapters = sortedChapters.filter((c) => {
    if (!chapterSearch.trim()) return true;
    const q = chapterSearch.toLowerCase();
    return (
      c.title?.toLowerCase().includes(q) ||
      `chương ${c.chapterOrder}`.includes(q) ||
      String(c.chapterOrder) === q
    );
  });

  const activeChapterIndex = sortedChapters.findIndex((c) => c.id === activeChapter?.id);

  const nextChapterOrder = chapters.length > 0 ? Math.max(...chapters.map((c) => c.chapterOrder)) + 1 : 1;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="h-full flex flex-col space-y-3.5">
          <div className="h-5 w-32 bg-surface rounded animate-pulse" />
          <div className="h-20 bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
          <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
            <div className="w-full lg:w-[350px] xl:w-[380px] 2xl:w-[410px] h-full bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
            <div className="flex-1 h-full bg-surface rounded-xl sm:rounded-2xl border border-border animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!book) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Link
            href={ROUTES.ADMIN.MANAGE_BOOK}
            className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
          <div className="bg-surface rounded-2xl border border-border p-12 text-center">
            <div className="w-16 h-16 bg-bg rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
              <BookOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">Không tìm thấy thông tin sách</h3>
            <p className="text-sm text-text-secondary mt-1 mb-4">
              Sách có thể đã bị xóa hoặc không tồn tại với ID: {bookId}.
            </p>
            <Button onClick={() => window.location.href = ROUTES.ADMIN.MANAGE_BOOK}>
              Về danh sách sách
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Hidden file input for uploading audio */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="audio/*"
        className="hidden"
      />

      <div className="h-full flex flex-col min-h-0 space-y-3 sm:space-y-3.5">
        {/* Breadcrumb */}
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

        {/* Book Header */}
        <BookHeader
          book={book}
          chapters={chapters}
          isRefreshing={isRefreshing}
          actionLoading={actionLoading}
          isVoicePlaying={isVoicePlaying}
          onReload={() => loadData()}
          onOpenEditBook={openEditBookModal}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onToggleVoiceAudio={handleToggleVoiceAudio}
        />

        {/* Mobile Tab Switcher */}
        <div className="flex lg:hidden border-b border-border bg-surface rounded-lg p-1 text-sm font-medium flex-shrink-0">
          <button
            onClick={() => setMobileTab('list')}
            className={`flex-1 py-2 text-center rounded-md transition-colors ${
              mobileTab === 'list'
                ? 'bg-accent text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Danh sách chương ({chapters.length})
          </button>
          <button
            onClick={() => setMobileTab('detail')}
            className={`flex-1 py-2 text-center rounded-md transition-colors ${
              mobileTab === 'detail'
                ? 'bg-accent text-white font-semibold'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Nội dung & Biên tập
          </button>
        </div>

        {/* Main workspace */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5 lg:gap-4.5 min-h-[420px]">
          {/* Chapter List */}
          <div
            className={`w-full lg:w-[350px] xl:w-[380px] 2xl:w-[410px] lg:flex-shrink-0 flex flex-col h-full min-h-0 ${
              !isSidebarOpen ? 'lg:hidden' : ''
            } ${mobileTab === 'detail' ? 'hidden lg:flex' : 'flex'}`}
          >
            <ChapterList
              chapters={chapters}
              selectedChapterId={selectedChapterId}
              filteredChapters={filteredChapters}
              chapterSearch={chapterSearch}
              onSearchChange={setChapterSearch}
              onSelectChapter={(id) => {
                setSelectedChapterId(id);
                setMobileTab('detail');
              }}
              onAddChapter={openAddChapterModal}
            />
          </div>

          {/* Chapter Workspace */}
          <div
            className={`flex-1 min-w-0 flex flex-col h-full min-h-0 ${
              mobileTab === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <ChapterWorkspace
              activeChapter={activeChapter}
              sortedChapters={sortedChapters}
              activeChapterIndex={activeChapterIndex}
              isEditingText={isEditingText}
              textDraft={textDraft}
              fontSize={fontSize}
              isSavingText={isSavingText}
              isCurrentProcessing={activeChapter?.status === 'PROCESSING_AUDIO'}
              isCurrentGenerating={activeChapter ? generatingChapterId === activeChapter.id : false}
              isCurrentUploading={activeChapter ? uploadingChapterId === activeChapter.id : false}
              copyFeedback={copyFeedback}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
              onEditInfo={openEditInfoModal}
              onGenerateVoice={handleGenerateVoice}
              onUploadAudio={triggerUploadClick}
              onDeleteChapter={handleDeleteActiveChapter}
              onSetEditingText={setIsEditingText}
              onTextDraftChange={setTextDraft}
              onSaveText={handleSaveText}
              onCopyText={handleCopyText}
              onSetFontSize={setFontSize}
              onSelectChapter={(id) => {
                setSelectedChapterId(id);
                setIsEditingText(false);
              }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditBookModal && (
        <EditBookModal
          isOpen={showEditBookModal}
          onClose={() => setShowEditBookModal(false)}
          book={book}
          categories={allCategories}
          authors={allAuthors}
          voices={allVoices}
          isSubmitting={isSubmittingBook}
          onSave={handleSaveBookEdit}
        />
      )}

      {showAddChapterModal && (
        <AddChapterModal
          isOpen={showAddChapterModal}
          onClose={() => setShowAddChapterModal(false)}
          defaultChapterOrder={nextChapterOrder}
          onSubmit={handleCreateChapter}
        />
      )}

      {showEditInfoModal && activeChapter && (
        <EditChapterModal
          isOpen={showEditInfoModal}
          onClose={() => setShowEditInfoModal(false)}
          chapter={activeChapter}
          bookId={bookId}
          onSuccess={handleEditChapterSuccess}
        />
      )}
    </AdminLayout>
  );
};

export const BookDetailPage = BookDetail;
export default BookDetail;
