"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/src/shared/constants";
import { AdminLayout } from "@/src/presentation/layouts";
import { bookService } from "@/src/infrastructure/api/services";
import type { Book } from "@/src/shared/types";
import { isBookPublished } from "@/src/shared/utils";
import { ConfirmDeleteModal, Pagination } from "@/src/presentation/components/common";
import {
  BookFilterToolbar,
  BookFormModal,
  BookReviewsModal,
  BookTable,
  toBookFormData,
  type BookFormValues,
} from "@/src/presentation/components/admin/book";
import {
  ADMIN_BOOKS_PER_PAGE,
  useAdminBookList,
  useBookFormOptions,
} from "@/src/presentation/hooks/admin";

const PUBLISH_ERROR =
  "Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.";

export const ManageBookPage = () => {
  const router = useRouter();
  const list = useAdminBookList();
  const { categories, authors, voices } = useBookFormOptions();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingReviewsBook, setViewingReviewsBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [busyBookId, setBusyBookId] = useState<number | null>(null);

  const runRowAction = async (bookId: number, task: () => Promise<void>, onError?: () => void) => {
    setBusyBookId(bookId);
    try {
      await task();
    } catch (error) {
      console.error("Book action failed:", error);
      onError?.();
    } finally {
      setBusyBookId(null);
    }
  };

  const handleTogglePublish = (book: Book) => {
    const publish = !isBookPublished(book);
    return runRowAction(
      book.id,
      async () => {
        await (publish ? bookService.publishBook(book.id) : bookService.unpublishBook(book.id));
        list.updateBook(book.id, { status: publish ? "PUBLISHED" : "UNPUBLISHED", isPublish: publish });
      },
      publish ? () => alert(PUBLISH_ERROR) : undefined,
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    await runRowAction(deletingBook.id, async () => {
      await bookService.deleteBook(deletingBook.id);
      // Refetch: removing a row shifts the following pages
      list.reload();
    });
    setDeletingBook(null);
  };

  const handleOpenEditModal = async (book: Book) => {
    try {
      setEditingBook((await bookService.getBookById(book.id)) || book);
    } catch (err) {
      console.error("Error fetching book detail for edit:", err);
      setEditingBook(book);
    }
  };

  // Both handlers let errors propagate so BookFormModal can show them inline
  const handleCreateBook = async (data: BookFormValues) => {
    await bookService.createBook(toBookFormData(data));
    setShowCreateModal(false);
    if (list.page === 0) list.reload();
    else list.goToPage(0);
  };

  const handleUpdateBook = async (data: BookFormValues) => {
    if (!editingBook) return;
    await bookService.updateBook(editingBook.id, toBookFormData(data));
    setEditingBook(null);
    list.reload();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <BookFilterToolbar
          filters={list.filters}
          hasFilters={list.hasFilters}
          categories={categories}
          authors={authors}
          onFilterChange={list.updateFilter}
          onReset={list.resetFilters}
          onCreate={() => setShowCreateModal(true)}
        />

        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <BookTable
            books={list.books}
            isLoading={list.isLoading}
            startIndex={list.page * ADMIN_BOOKS_PER_PAGE}
            busyBookId={busyBookId}
            onOpen={(book) => router.push(ROUTES.ADMIN.BOOK_DETAIL(book.id))}
            onViewReviews={setViewingReviewsBook}
            onTogglePublish={handleTogglePublish}
            onEdit={handleOpenEditModal}
            onDelete={setDeletingBook}
          />

          {!list.isLoading && list.books.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              <Pagination
                page={list.page}
                totalPage={list.totalPage}
                onPageChange={list.goToPage}
              />
            </div>
          )}
        </div>

        {showCreateModal && (
          <BookFormModal
            mode="create"
            categories={categories}
            authors={authors}
            voices={voices}
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateBook}
          />
        )}

        {editingBook && (
          <BookFormModal
            mode="edit"
            book={editingBook}
            categories={categories}
            authors={authors}
            voices={voices}
            onClose={() => setEditingBook(null)}
            onSubmit={handleUpdateBook}
          />
        )}

        {viewingReviewsBook && (
          <BookReviewsModal
            onClose={() => setViewingReviewsBook(null)}
            book={viewingReviewsBook}
          />
        )}

        <ConfirmDeleteModal
          isOpen={!!deletingBook}
          onClose={() => setDeletingBook(null)}
          onConfirm={handleConfirmDelete}
          title="Xóa sách"
          itemName={deletingBook?.title}
          isLoading={deletingBook != null && busyBookId === deletingBook.id}
        />
      </div>
    </AdminLayout>
  );
};
