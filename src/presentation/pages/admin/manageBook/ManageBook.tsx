"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/src/shared/constants";
import { AdminLayout } from "@/src/presentation/layouts";
import {
  bookService,
  voiceService,
  categoryService,
  authorService,
} from "@/src/infrastructure/api/services";
import type {
  Book,
  Voice,
  Category,
  Author,
  PaginatedResponse,
} from "@/src/shared/types";
import { Button, Badge, Modal } from "@/src/presentation/components/ui";
import {
  MultiSelectCombobox,
  DropSearch,
} from "@/src/presentation/components/common";
import { EditBookModal } from "@/src/presentation/components/admin/bookDetail";
import { BookReviewsModal } from "@/src/presentation/components/admin/BookReviewsModal";
import {
  Plus,
  Star,
  Search,
  X,
  RotateCcw,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";

const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "primary" | "success" | "warning" | "error";
  }
> = {
  PROCESSING: { label: "Đang xử lý", variant: "warning" },
  PUBLISHED: { label: "Đã xuất bản", variant: "success" },
};

const ITEMS_PER_PAGE = 10;

export const ManageBookPage = () => {
  const router = useRouter();

  // Data state
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState({
    page: 0,
    totalPage: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Filter state
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [authorFilter, setAuthorFilter] = useState<number | null>(null);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      result = result.filter((b) => b.title?.toLowerCase().includes(q));
    }
    if (statusFilter) {
      result = result.filter((b) => {
        const currentStatus =
          b.status || (b.isPublish ? "PUBLISHED" : "PROCESSING");
        return currentStatus === statusFilter;
      });
    }
    if (categoryFilter) {
      result = result.filter((b) => {
        const cats = b.categories || b.bookCategories || [];
        return cats.some(
          (bc: any) => (bc.category?.id ?? bc.id) === categoryFilter,
        );
      });
    }
    if (authorFilter) {
      result = result.filter((b) => {
        const auths = b.authors || b.bookAuthors || [];
        return auths.some(
          (ba: any) => (ba.author?.id ?? ba.id) === authorFilter,
        );
      });
    }
    return result;
  }, [books, searchKeyword, statusFilter, categoryFilter, authorFilter]);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [viewingReviewsBook, setViewingReviewsBook] = useState<Book | null>(
    null,
  );
  const [isUpdatingBook, setIsUpdatingBook] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: 0,
    voiceId: 0,
    categoryIds: [] as number[],
    authorIds: [] as number[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);

  const fetchBooks = useCallback(async (page: number) => {
    setIsLoading(true);
    try {
      const data = await bookService.getBooks({ page, size: ITEMS_PER_PAGE });
      if (data && data.content) {
        setBooks(data.content);
        setPagination({
          page: data.page,
          totalPage: data.totalPage,
          total: data.total,
        });
      } else {
        setBooks([]);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilters = async () => {
    try {
      const [voicesRes, categoriesRes, authorsRes] = await Promise.allSettled([
        voiceService.getVoices(),
        categoryService.getCategories(),
        authorService.getAuthors(),
      ]);

      if (voicesRes.status === "fulfilled" && voicesRes.value?.content) {
        setVoices(voicesRes.value.content);
      } else if (voicesRes.status === "rejected") {
        console.error("Error fetching voices:", voicesRes.reason);
      }

      if (
        categoriesRes.status === "fulfilled" &&
        Array.isArray(categoriesRes.value)
      ) {
        setCategories(categoriesRes.value);
      } else if (categoriesRes.status === "rejected") {
        console.error("Error fetching categories:", categoriesRes.reason);
      }

      if (
        authorsRes.status === "fulfilled" &&
        Array.isArray(authorsRes.value)
      ) {
        setAuthors(authorsRes.value);
      } else if (authorsRes.status === "rejected") {
        console.error("Error fetching authors:", authorsRes.reason);
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  useEffect(() => {
    fetchBooks(0);
    fetchFilters();
  }, []);

  const handlePageChange = (newPage: number) => {
    fetchBooks(newPage);
  };

  const handlePublish = async (bookId: number) => {
    setActionLoading(bookId);
    try {
      await bookService.publishBook(bookId);
      await fetchBooks(pagination.page);
    } catch (error) {
      console.error("Error publishing book:", error);
      alert(
        "Không thể xuất bản sách. Vui lòng kiểm tra: Đã chọn giọng đọc, có chapter, chapter đã có audio.",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnpublish = async (bookId: number) => {
    setActionLoading(bookId);
    try {
      await bookService.unpublishBook(bookId);
      await fetchBooks(pagination.page);
    } catch (error) {
      console.error("Error unpublishing book:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (bookId: number) => {
    if (!confirm("Bạn có chắc muốn xóa sách này?")) return;
    setActionLoading(bookId);
    try {
      await bookService.deleteBook(bookId);
      await fetchBooks(pagination.page);
    } catch (error) {
      console.error("Error deleting book:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenEditModal = async (book: Book) => {
    try {
      if (
        voices.length === 0 ||
        categories.length === 0 ||
        authors.length === 0
      ) {
        fetchFilters();
      }
      const detailedBook = await bookService.getBookById(book.id);
      setEditingBook(detailedBook || book);
    } catch (err) {
      console.error("Error fetching book detail for edit:", err);
      setEditingBook(book);
    }
  };

  const handleUpdateBook = async (data: {
    title: string;
    description: string;
    price: number;
    voiceId: number;
    categoryIds: number[];
    authorIds: number[];
    coverFile?: File | null;
  }) => {
    if (!editingBook) return;

    setIsUpdatingBook(true);
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
      form.append(
        "book",
        new Blob([JSON.stringify(bookData)], { type: "application/json" }),
      );
      if (data.coverFile) {
        form.append("bookCover", data.coverFile);
      }

      await bookService.updateBook(editingBook.id, form);
      setEditingBook(null);
      await fetchBooks(pagination.page);
    } catch (err) {
      console.error("Error updating book:", err);
      alert("Có lỗi xảy ra khi cập nhật thông tin sách.");
    } finally {
      setIsUpdatingBook(false);
    }
  };

  const handleCreateBook = async () => {
    if (!formData.title) {
      alert("Vui lòng nhập tiêu đề sách");
      return;
    }
    if (!pdfFile) {
      alert("Vui lòng chọn file PDF");
      return;
    }

    setIsSubmitting(true);
    try {
      const form = new FormData();
      const bookData = {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        voice: formData.voiceId ? { id: formData.voiceId } : undefined,
        categories: formData.categoryIds.map((id) => ({ id })),
        authors: formData.authorIds.map((id) => ({ id })),
      };
      form.append(
        "book",
        new Blob([JSON.stringify(bookData)], { type: "application/json" }),
      );
      form.append("pdfFile", pdfFile);
      if (coverFile) {
        form.append("bookCover", coverFile);
      }

      await bookService.createBook(form);

      setShowCreateModal(false);
      resetForm();
      setRefreshKey((k) => k + 1);
    } catch (error) {
      console.error("Error creating book:", error);
      alert("Có lỗi xảy ra khi tạo sách");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      voiceId: 0,
      categoryIds: [],
      authorIds: [],
    });
    setPdfFile(null);
    setCoverFile(null);
  };

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || {
      label: status,
      variant: "default" as const,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const renderPagination = () => {
    const { page, totalPage } = pagination;
    const pages: (number | string)[] = [];

    if (totalPage <= 7) {
      for (let i = 0; i < totalPage; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 2) pages.push("...");
      for (
        let i = Math.max(1, page - 1);
        i <= Math.min(totalPage - 2, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPage - 3) pages.push("...");
      pages.push(totalPage - 1);
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 0}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Button>
        {pages.map((p, i) =>
          typeof p === "number" ? (
            <button
              key={i}
              onClick={() => handlePageChange(p)}
              className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                p === page
                  ? "bg-accent text-white"
                  : "text-text-secondary hover:bg-bg"
              }`}
            >
              {p + 1}
            </button>
          ) : (
            <span key={i} className="px-2 text-text-muted">
              {p}
            </span>
          ),
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= totalPage - 1}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Button>
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Unified Responsive Toolbar: Search + 3 DropSearches + Add Book Button */}
        <div className="bg-surface rounded-xl border border-border p-3 shadow-sm">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
            {/* Search Input - Title Only */}
            <div className="relative flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên sách..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-bg border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors h-10"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
              {searchKeyword && (
                <button
                  type="button"
                  onClick={() => setSearchKeyword("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-text-muted hover:text-text-primary rounded-full hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:flex items-center gap-2.5">
              {/* DropSearch: Thể loại */}
              <div className="w-full lg:w-44">
                <DropSearch
                  placeholder="Tất cả thể loại"
                  searchPlaceholder="Tìm thể loại..."
                  allLabel="Tất cả thể loại"
                  options={categories.map((cat) => ({
                    value: cat.id,
                    label: cat.name,
                  }))}
                  value={categoryFilter}
                  onChange={(val) =>
                    setCategoryFilter(val ? Number(val) : null)
                  }
                />
              </div>

              {/* DropSearch: Tác giả */}
              <div className="w-full lg:w-44">
                <DropSearch
                  placeholder="Tất cả tác giả"
                  searchPlaceholder="Tìm tác giả..."
                  allLabel="Tất cả tác giả"
                  options={authors.map((auth) => ({
                    value: auth.id,
                    label: auth.fullName || `Tác giả #${auth.id}`,
                  }))}
                  value={authorFilter}
                  onChange={(val) => setAuthorFilter(val ? Number(val) : null)}
                />
              </div>

              {/* DropSearch: Trạng thái */}
              <div className="w-full lg:w-40">
                <DropSearch
                  placeholder="Tất cả trạng thái"
                  searchPlaceholder="Tìm trạng thái..."
                  allLabel="Tất cả trạng thái"
                  options={[
                    { value: "PROCESSING", label: "Đang xử lý" },
                    { value: "PUBLISHED", label: "Đã xuất bản" },
                  ]}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val ? String(val) : "")}
                />
              </div>
            </div>

            {/* Reset Filters button */}
            {(searchKeyword ||
              categoryFilter ||
              authorFilter ||
              statusFilter) && (
              <button
                type="button"
                onClick={() => {
                  setSearchKeyword("");
                  setCategoryFilter(null);
                  setAuthorFilter(null);
                  setStatusFilter("");
                }}
                className="h-10 px-3 text-xs font-medium text-text-muted hover:text-error hover:bg-error-light/50 border border-border hover:border-error/20 rounded-lg transition-colors flex items-center justify-center gap-1.5 flex-shrink-0"
                title="Xóa tất cả bộ lọc"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại</span>
              </button>
            )}

            {/* Thêm sách mới: Cùng dòng đẹp mắt */}
            <div className="flex-shrink-0">
              <Button
                variant="primary"
                onClick={() => setShowCreateModal(true)}
                className="w-full sm:w-auto h-10 px-4 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm hover:shadow"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm sách</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[880px] border-collapse">
              <colgroup>
                <col className="w-14" />
                <col className="w-auto" />
                <col className="w-28" />
                <col className="w-60" />
                <col className="w-60" />
                <col className="w-28" />
                <col className="w-36" />
                <col className="w-20" />
              </colgroup>
              <thead>
                <tr className="border-b border-border bg-bg/80 text-text-secondary text-xs font-semibold uppercase tracking-wider">
                  <th className="text-center px-3 py-3.5 w-14 font-mono whitespace-nowrap">
                    STT
                  </th>
                  <th className="text-left px-4 py-3.5 min-w-[180px]">
                    Tên sách
                  </th>
                  <th className="text-left px-4 py-3.5 w-28 whitespace-nowrap">
                    Giá
                  </th>
                  <th className="text-left px-4 py-3.5 w-36">Thể loại</th>
                  <th className="text-left px-4 py-3.5 w-36">Tác giả</th>
                  <th className="text-left px-4 py-3.5 w-28 whitespace-nowrap">
                    Đánh giá
                  </th>
                  <th className="text-left px-4 py-3.5 w-36 whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="text-center px-3 py-3.5 w-20 whitespace-nowrap">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-text-secondary">
                        <svg
                          className="w-5 h-5 animate-spin"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                          />
                        </svg>
                        Đang tải...
                      </div>
                    </td>
                  </tr>
                ) : filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center">
                      <div className="text-text-secondary">
                        <svg
                          className="w-12 h-12 mx-auto mb-3 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                        <p className="font-medium">Chưa có sách nào phù hợp</p>
                        <p className="text-sm mt-1">
                          Thử thay đổi bộ lọc hoặc thêm sách mới
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book, index) => {
                    const startIndex = pagination.page * ITEMS_PER_PAGE;
                    return (
                      <tr
                        key={book.id}
                        onClick={() =>
                          router.push(ROUTES.ADMIN.BOOK_DETAIL(book.id))
                        }
                        className="hover:bg-bg transition-colors cursor-pointer"
                      >
                        {/* STT */}
                        <td className="px-3 py-3 text-center text-sm text-text-secondary font-mono">
                          {startIndex + index + 1}
                        </td>

                        {/* Book info */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-14 bg-bg border border-border rounded overflow-hidden flex-shrink-0">
                              {book.coverImage ? (
                                <img
                                  src={book.coverImage}
                                  alt={book.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-text-muted">
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={1.5}
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-medium text-text-primary line-clamp-1"
                                title={book.title || "Chưa có tiêu đề"}
                              >
                                {book.title || "Chưa có tiêu đề"}
                              </p>
                              {book.voice && (
                                <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                                    />
                                  </svg>
                                  {book.voice.name}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-3 text-sm text-text-secondary">
                          {book.price
                            ? `${Number(book.price).toLocaleString()}đ`
                            : "Miễn phí"}
                        </td>

                        {/* Categories */}
                        <td className="px-4 py-3">
                          {(() => {
                            const bookCats =
                              book.categories || book.bookCategories || [];
                            return bookCats.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {bookCats
                                  .slice(0, 2)
                                  .map((bc: any, idx: number) => {
                                    const catName =
                                      bc.category?.name ||
                                      bc.name ||
                                      "Thể loại";
                                    const catId =
                                      bc.category?.id || bc.id || idx;
                                    return (
                                      <Badge
                                        key={catId}
                                        variant="primary"
                                        className="text-xs"
                                      >
                                        {catName}
                                      </Badge>
                                    );
                                  })}
                                {bookCats.length > 2 && (
                                  <span className="text-xs text-text-muted self-center">
                                    +{bookCats.length - 2}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-text-muted italic">
                                —
                              </span>
                            );
                          })()}
                        </td>

                        {/* Authors */}
                        <td className="px-4 py-3">
                          {(() => {
                            const bookAuths =
                              book.authors || book.bookAuthors || [];
                            const authorNames = bookAuths
                              .map(
                                (ba: any) => ba.author?.fullName || ba.fullName,
                              )
                              .filter(Boolean)
                              .join(", ");
                            return authorNames ? (
                              <span
                                className="text-sm text-text-secondary line-clamp-1"
                                title={authorNames}
                              >
                                {authorNames}
                              </span>
                            ) : (
                              <span className="text-xs text-text-muted italic">
                                —
                              </span>
                            );
                          })()}
                        </td>

                        {/* Average Rating */}
                        <td className="px-4 py-3">
                          {typeof book.averageRating === "number" &&
                          book.averageRating > 0 ? (
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                              <Star className="w-4 h-4 fill-amber-400 text-amber-400 flex-shrink-0" />
                              <span className="font-semibold text-text-primary text-sm">
                                {book.averageRating.toFixed(1)}
                              </span>
                              <span className="text-xs text-text-muted">
                                / 5
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-text-muted italic flex items-center gap-1 whitespace-nowrap">
                              <Star className="w-3.5 h-3.5 text-text-muted opacity-40 flex-shrink-0" />
                              Chưa có
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusBadge(
                              book.status ||
                                (book.isPublish ? "PUBLISHED" : "PROCESSING"),
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td
                          className="px-3 py-3.5 text-center whitespace-nowrap"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center">
                            {/* Dropdown Menu */}
                            <div className="relative group">
                              <button
                                type="button"
                                className="h-8 w-8 inline-flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg border border-transparent hover:border-border rounded-lg transition-colors cursor-pointer flex-shrink-0"
                                title="Thao tác khác"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              <div className="absolute right-0 top-full mt-1 bg-surface border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 min-w-[170px] py-1 overflow-hidden text-left">
                                <button
                                  type="button"
                                  onClick={() => setViewingReviewsBook(book)}
                                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <MessageSquare className="w-4 h-4 text-accent" />
                                  <span>Xem bình luận</span>
                                </button>
                                {book.status === "PUBLISHED" ||
                                book.isPublish ? (
                                  <button
                                    type="button"
                                    onClick={() => handleUnpublish(book.id)}
                                    disabled={actionLoading === book.id}
                                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    <EyeOff className="w-4 h-4 text-text-secondary" />
                                    <span>Gỡ xuất bản</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handlePublish(book.id)}
                                    disabled={actionLoading === book.id}
                                    className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                                  >
                                    <Eye className="w-4 h-4 text-text-secondary" />
                                    <span>Đăng xuất bản</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(book)}
                                  className="w-full px-3 py-2 text-left text-sm text-text-primary hover:bg-bg flex items-center gap-2 transition-colors cursor-pointer"
                                >
                                  <Pencil className="w-4 h-4 text-text-secondary" />
                                  <span>Sửa sách</span>
                                </button>
                                <div className="border-t border-border my-1" />
                                <button
                                  type="button"
                                  onClick={() => handleDelete(book.id)}
                                  disabled={actionLoading === book.id}
                                  className="w-full px-3 py-2 text-left text-sm text-error hover:bg-error-light flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4 text-error" />
                                  <span>Xóa sách</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && filteredBooks.length > 0 && (
            <div className="px-4 py-3 border-t border-border">
              {renderPagination()}
            </div>
          )}
        </div>

        {/* Create Modal */}
        {showCreateModal && (
          <Modal
            title="Thêm sách mới"
            onClose={() => {
              setShowCreateModal(false);
              resetForm();
            }}
            size="lg"
          >
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Tiêu đề <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  placeholder="Nhập tiêu đề sách"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
                  rows={3}
                  placeholder="Nhập mô tả sách"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Giá (VNĐ)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    placeholder="0 = Miễn phí"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1.5">
                    Giọng đọc
                  </label>
                  <select
                    value={formData.voiceId}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        voiceId: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent bg-surface"
                  >
                    <option value={0}>Chọn giọng đọc</option>
                    {voices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Danh mục
                </label>
                <MultiSelectCombobox
                  options={categories.map((c) => ({ id: c.id, name: c.name }))}
                  selectedIds={formData.categoryIds}
                  onChange={(ids) =>
                    setFormData({ ...formData, categoryIds: ids })
                  }
                  placeholder="Tìm kiếm và chọn danh mục..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Tác giả
                </label>
                <MultiSelectCombobox
                  options={authors.map((a) => ({
                    id: a.id,
                    name: a.fullName || `Tác giả #${a.id}`,
                  }))}
                  selectedIds={formData.authorIds}
                  onChange={(ids) =>
                    setFormData({ ...formData, authorIds: ids })
                  }
                  placeholder="Tìm kiếm và chọn tác giả..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  File PDF <span className="text-error">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                />
                {pdfFile && (
                  <p className="text-xs text-success mt-1">✓ {pdfFile.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">
                  Ảnh bìa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm"
                />
                {coverFile && (
                  <p className="text-xs text-success mt-1">
                    ✓ {coverFile.name}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border sticky bottom-0 bg-surface">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button onClick={handleCreateBook} disabled={isSubmitting}>
                  {isSubmitting ? "Đang tạo..." : "Tạo sách"}
                </Button>
              </div>
            </div>
          </Modal>
        )}

        {/* Edit Book Modal */}
        {editingBook && (
          <EditBookModal
            isOpen={!!editingBook}
            onClose={() => setEditingBook(null)}
            book={editingBook}
            categories={categories}
            authors={authors}
            voices={voices}
            isSubmitting={isUpdatingBook}
            onSave={handleUpdateBook}
          />
        )}

        {/* Book Reviews & Comments Modal */}
        {viewingReviewsBook && (
          <BookReviewsModal
            isOpen={!!viewingReviewsBook}
            onClose={() => setViewingReviewsBook(null)}
            book={viewingReviewsBook}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default ManageBookPage;
