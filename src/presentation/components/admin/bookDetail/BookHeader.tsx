import React, { useRef, useState } from "react";
import Link from "next/link";
import { Button, Badge } from "@/src/presentation/components/ui";
import { ROUTES } from "@/src/shared/constants";
import type { Book, Chapter } from "@/src/shared/types";
import {
  ArrowLeft,
  BookOpen,
  RotateCw,
  Pencil,
  Eye,
  EyeOff,
  Volume2,
  FileText,
  Play,
  Pause,
} from "lucide-react";

interface BookHeaderProps {
  book: Book;
  chapters: Chapter[];
  isRefreshing: boolean;
  actionLoading: string | null;
  isVoicePlaying: boolean;
  onReload: () => void;
  onOpenEditBook: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  onToggleVoiceAudio: (audioUrl?: string) => void;
}

const resolveAudioUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const backendBase = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083/api"
  ).replace(/\/api\/?$/, "");
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
};

export const BookHeader: React.FC<BookHeaderProps> = ({
  book,
  chapters,
  isRefreshing,
  actionLoading,
  isVoicePlaying,
  onReload,
  onOpenEditBook,
  onPublish,
  onUnpublish,
  onToggleVoiceAudio,
}) => {
  const bookStatusConfig: Record<
    string,
    {
      label: string;
      variant: "default" | "primary" | "success" | "warning" | "error";
    }
  > = {
    PROCESSING: { label: "Đang xử lý", variant: "warning" },
    PUBLISHED: { label: "Đã xuất bản", variant: "success" },
  };

  const bookStatus = bookStatusConfig[book.status] || {
    label: book.status,
    variant: "default" as const,
  };

  return (
    <div className="bg-surface rounded-xl sm:rounded-2xl border border-border p-3.5 sm:p-4 shadow-sm flex-shrink-0">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3.5">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
          <div className="w-12 h-16 sm:w-14 sm:h-20 bg-bg border border-border rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center shadow-sm">
            {book.coverImage ? (
              <img
                src={book.coverImage}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <BookOpen className="w-6 h-6 text-text-muted" />
            )}
          </div>

          <div className="min-w-0 space-y-1.5 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                {book.title || "Chưa có tiêu đề"}
              </h1>
              <Badge variant={bookStatus.variant}>{bookStatus.label}</Badge>
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap">
              {book.bookAuthors && book.bookAuthors.length > 0 && (
                <span className="font-medium text-text-primary flex items-center gap-1">
                  {book.bookAuthors.map((ba) => ba.author.fullName).join(", ")}
                </span>
              )}
              {book.bookCategories && book.bookCategories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {book.bookCategories.map((bc) => (
                    <span
                      key={bc.id}
                      className="px-2 py-0.5 bg-bg border border-border rounded-md text-[11px] font-medium text-text-secondary"
                    >
                      {bc.category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-text-secondary flex-wrap pt-0.5">
              <span className="font-semibold text-accent text-sm">
                {book.price
                  ? `${Number(book.price).toLocaleString()}đ`
                  : "Miễn phí"}
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
            className="text-xs"
            title="Chỉnh sửa thông tin sách"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Sửa sách</span>
          </Button>
          {book.isPublish ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onUnpublish}
              disabled={actionLoading === "unpublish"}
              className="text-xs border border-border"
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
              className="text-xs shadow-sm"
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

export default BookHeader;
