import React from "react";
import { Button } from "@/src/presentation/components/common";
import { getBookStatusBadge } from "@/src/presentation/utils/admin";
import type { Book, Chapter } from "@/src/shared/types";
import {
  formatBookPrice,
  getBookAuthorNames,
  getBookCategories,
  isBookPublished,
} from "@/src/shared/utils";
import { BookThumbnail } from "../book";
import {
  Pencil,
  Eye,
  EyeOff,
  Volume2,
  FileText,
} from "lucide-react";

interface BookHeaderProps {
  book: Book;
  chapters: Chapter[];
  actionLoading: string | null;
  onOpenEditBook: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
}

export const BookHeader: React.FC<BookHeaderProps> = ({
  book,
  chapters,
  actionLoading,
  onOpenEditBook,
  onPublish,
  onUnpublish,
}) => {
  const authorNames = getBookAuthorNames(book, '');
  const categories = getBookCategories(book);
  const published = isBookPublished(book);

  return (
    <div className="bg-surface rounded-xl sm:rounded-2xl border border-border p-3.5 sm:p-4 shadow-sm flex-shrink-0">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <BookThumbnail
            title={book.title}
            coverImage={book.coverImage}
            className="w-12 h-16 sm:w-14 sm:h-20 rounded-lg sm:rounded-xl shadow-sm"
            iconClassName="w-6 h-6"
          />

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {book.title || "Chưa có tiêu đề"}
              </h1>
              {getBookStatusBadge(book)}
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
              {authorNames && (
                <span className="font-medium text-text-primary flex items-center gap-1">{authorNames}</span>
              )}
              {categories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {categories.map((category) => (
                    <span
                      key={category.id}
                      className="px-2 py-0.5 bg-bg border border-border rounded-md text-[11px] font-medium text-text-secondary"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap pt-0.5">
              <span className="font-semibold text-accent text-sm">
                {formatBookPrice(book)}
              </span>
              <span>•</span>
              <span>{chapters.length} chương</span>
              {book.voice && (
                <>
                  <span>•</span>
                  <span className="inline-flex items-center gap-1 font-medium bg-accent/10 px-2 py-0.5 rounded-md text-accent">
                    <Volume2 className="w-3.5 h-3.5" />
                    {book.voice.name}
                  </span>
                </>
              )}
              {book.contentFile && (
                <>
                  <span>•</span>
                  <a
                    href={book.contentFile}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-text-secondary hover:text-accent transition-colors"
                    title="Mở hoặc tải file PDF gốc"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>PDF gốc</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 self-end lg:self-center flex-wrap">
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
    </div>
  );
};
