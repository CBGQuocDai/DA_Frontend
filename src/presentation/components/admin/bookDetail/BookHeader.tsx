import React from "react";
import Link from "next/link";
import { Button } from "@/src/presentation/components/common";
import { getBookStatusBadge } from "@/src/presentation/utils/admin";
import { ROUTES } from "@/src/shared/constants";
import type { Book } from "@/src/shared/types";
import { isBookPublished } from "@/src/shared/utils";
import { ArrowLeft, FileText, Pencil, Eye, EyeOff } from "lucide-react";

interface BookHeaderProps {
  book: Book;
  actionLoading: string | null;
  onOpenEditBook: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export const BookHeader: React.FC<BookHeaderProps> = ({
  book,
  actionLoading,
  onOpenEditBook,
  onPublish,
  onUnpublish,
}) => {
  const published = isBookPublished(book);

  return (
    <div className="bg-surface rounded-xl sm:rounded-2xl border border-border px-2.5 py-1.5 shadow-sm flex-shrink-0 flex items-center gap-2.5">
      <Link
        href={ROUTES.ADMIN.MANAGE_BOOK}
        className="p-1.5 rounded-md text-text-secondary hover:bg-bg hover:text-text-primary transition-colors flex-shrink-0"
        title="Quay lại danh sách"
        aria-label="Quay lại danh sách"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <div className="min-w-0 flex-1 flex items-center gap-2">
        <h1
          className="text-sm sm:text-base font-bold text-text-primary tracking-tight truncate"
          title={book.title}
        >
          {book.title || "Chưa có tiêu đề"}
        </h1>
        <span className="flex-shrink-0">{getBookStatusBadge(book)}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {book.contentFile?.url && (
          <a
            href={book.contentFile.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Mở file nội dung gốc trong tab mới"
            aria-label="Mở file nội dung gốc"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-colors duration-150 bg-surface text-text-primary border border-border hover:bg-bg"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nội dung gốc</span>
          </a>
        )}
        <Button
          variant="secondary"
          size="sm"
          onClick={onOpenEditBook}
          title="Chỉnh sửa thông tin sách"
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>Sửa sách</span>
        </Button>
        {published ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onUnpublish}
            disabled={actionLoading === "unpublish"}
            className="border border-border"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>
              {actionLoading === "unpublish" ? "Đang gỡ..." : "Gỡ sách"}
            </span>
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            onClick={onPublish}
            disabled={actionLoading === "publish"}
            className="shadow-sm"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>
              {actionLoading === "publish" ? "Đang đăng..." : "Đăng xuất bản"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
};
