"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/src/shared/constants";
import { AdminLayout } from "@/src/presentation/layouts";
import { bookService } from "@/src/infrastructure/api/services";
import type { Book } from "@/src/shared/types";
import { getApiErrorMessage, isBookPublished } from "@/src/shared/utils";
import { ConfirmDeleteModal, Pagination, showAlert, toast } from "@/src/presentation/components/common";
import {
  BookFilterToolbar,
  BookFormModal,
  BookReviewsModal,
  BookTable,
  toBookPayload,
  type BookFormValues,
} from "@/src/presentation/components/admin/book";
import {
  ADMIN_BOOKS_PER_PAGE,
  useAdminBookList,
  useBookFormOptions,
} from "@/src/presentation/hooks/admin";
import { BOOK_PUBLISH_ERROR, BOOK_UNPUBLISH_ERROR } from "@/src/presentation/utils/admin";

/** Trang quản lý sách: lọc, phân trang, thêm/sửa/xóa, xuất bản và xem đánh giá. */
export const ManageBookPage = () => {
  const router = useRouter();
  const list = useAdminBookList();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  // Bộ lọc cần thể loại + tác giả ngay; giọng đọc chỉ tải khi mở form thêm/sửa
  const { categories, authors, voices } = useBookFormOptions(true, showCreateModal || editingBook !== null);
  const [viewingReviewsBook, setViewingReviewsBook] = useState<Book | null>(null);
  const [deletingBook, setDeletingBook] = useState<Book | null>(null);
  const [busyBookId, setBusyBookId] = useState<number | null>(null);

  // Chạy một thao tác trên một dòng: khóa dòng đó trong lúc chờ và báo lỗi nếu thất bại
  const runRowAction = async (bookId: number, task: () => Promise<void>, errorMessage: string) => {
    setBusyBookId(bookId);
    try {
      await task();
    } catch (error) {
      console.error("Book action failed:", error);
      showAlert(getApiErrorMessage(error, errorMessage));
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
        list.updateBook(book.id, { status: publish ? "PUBLISHED" : "UNPUBLISHED" });
        toast.success(`Đã ${publish ? "xuất bản" : "gỡ xuất bản"} sách “${book.title}”`);
      },
      publish ? BOOK_PUBLISH_ERROR : BOOK_UNPUBLISH_ERROR,
    );
  };

  const handleConfirmDelete = async () => {
    if (!deletingBook) return;
    await runRowAction(
      deletingBook.id,
      async () => {
        await bookService.deleteBook(deletingBook.id);
        toast.success(`Đã xóa sách “${deletingBook.title}”`);
        // Tải lại: xóa một dòng làm các trang phía sau bị dồn lên
        list.reload();
      },
      "Không xóa được sách, thử lại sau",
    );
    setDeletingBook(null);
  };

  // Lấy bản chi tiết để form có đủ đường dẫn file hiện tại; lỗi thì dùng tạm dữ liệu của dòng
  const handleOpenEditModal = async (book: Book) => {
    try {
      setEditingBook(await bookService.getBookById(book.id));
    } catch (err) {
      console.error("Error fetching book detail for edit:", err);
      setEditingBook(book);
    }
  };

  // Cả hai handler đều ném lỗi tiếp để BookFormModal hiển thị ngay trong modal
  const handleCreateBook = async (data: BookFormValues) => {
    await bookService.createBook(await toBookPayload(data));
    setShowCreateModal(false);
    toast.success(`Đã thêm sách “${data.title}”`);
    // Sách mới nằm ở trang đầu
    if (list.page === 0) list.reload();
    else list.goToPage(0);
  };

  const handleUpdateBook = async (data: BookFormValues) => {
    if (!editingBook) return;
    await bookService.updateBook(editingBook.id, await toBookPayload(data, editingBook));
    setEditingBook(null);
    toast.success(`Đã cập nhật sách “${data.title}”`);
    list.reload();
  };

  return (
    <AdminLayout>
      <div className="w-full h-full flex-1 flex flex-col min-h-0 gap-4">
        <BookFilterToolbar
          filters={list.filters}
          hasFilters={list.hasFilters}
          categories={categories}
          authors={authors}
          onFilterChange={list.updateFilter}
          onReset={list.resetFilters}
          onCreate={() => setShowCreateModal(true)}
        />

        <div className="flex-1 min-h-[16rem] bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div className="flex-1 min-h-0 overflow-auto">
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
          </div>

          {!list.isLoading && list.books.length > 0 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-border">
              <Pagination
                page={list.page}
                totalPage={list.totalPage}
                onPageChange={list.goToPage}
                className=""
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
