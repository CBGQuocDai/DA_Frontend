"use client";

import { useState } from "react";
import { PenLine, Plus } from "lucide-react";
import { AdminLayout } from "@/src/presentation/layouts";
import { authorService } from "@/src/infrastructure/api/services";
import type { Author } from "@/src/shared/types";
import { getApiErrorMessage } from "@/src/shared/utils";
import {
  Button,
  ConfirmDeleteModal,
  ErrorState,
  Pagination,
  SearchInput,
  showAlert,
} from "@/src/presentation/components/common";
import {
  AuthorAvatar,
  AuthorModal,
  CatalogTable,
  type CatalogColumn,
} from "@/src/presentation/components/admin/catalog";
import { invalidateBookFormOptions, useAdminSearchList } from "@/src/presentation/hooks/admin";

const columns: CatalogColumn<Author>[] = [
  {
    header: "Tác giả",
    className: "w-72",
    render: (author) => (
      <div className="flex items-center gap-3 min-w-0">
        <AuthorAvatar name={author.fullName} url={author.avatar?.url} />
        <p className="text-sm font-semibold text-text-primary truncate" title={author.fullName}>
          {author.fullName}
        </p>
      </div>
    ),
  },
  {
    header: "Tiểu sử",
    className: "text-xs text-text-secondary",
    render: (author) =>
      author.bio ? (
        <p className="line-clamp-2 leading-relaxed max-w-xl" title={author.bio}>
          {author.bio}
        </p>
      ) : (
        <span className="italic text-text-muted">Chưa có tiểu sử</span>
      ),
  },
];

export const ManageAuthorPage = () => {
  const list = useAdminSearchList(authorService.searchAuthors);
  // `undefined` = closed, `null` = creating, Author = editing
  const [editing, setEditing] = useState<Author | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Author | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaved = () => {
    invalidateBookFormOptions();
    list.reload();
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await authorService.deleteAuthor(deleting.id);
      invalidateBookFormOptions();
      setDeleting(null);
      list.reload();
    } catch (error) {
      console.error("Error deleting author:", error);
      setDeleting(null);
      showAlert(getApiErrorMessage(error, "Không xóa được tác giả, thử lại sau"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="w-full h-full flex-1 flex flex-col min-h-0 space-y-4">
        <div className="flex-shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-3">
            <SearchInput
              value={list.keyword}
              onChange={list.setKeyword}
              placeholder="Tìm theo tên tác giả..."
              className="flex-1 max-w-md"
            />
            {!list.isLoading && (
              <span className="hidden sm:inline text-xs text-text-muted tabular-nums" aria-live="polite">
                {list.total} tác giả
              </span>
            )}
          </div>
          <Button onClick={() => setEditing(null)} className="h-10 px-4 rounded-xl shadow-sm hover:shadow">
            <Plus className="w-4 h-4" />
            <span>Thêm tác giả</span>
          </Button>
        </div>

        {list.error && <ErrorState message={list.error} onRetry={list.reload} className="flex-shrink-0" />}

        <div className="flex-1 min-h-0 bg-surface rounded-xl border border-border overflow-hidden shadow-sm flex flex-col">
          <div
            className={`flex-1 min-h-0 overflow-auto transition-opacity ${list.isFetching && !list.isLoading ? "opacity-60" : ""}`}
            aria-busy={list.isFetching}
          >
            <CatalogTable
              items={list.items}
              columns={columns}
              startIndex={list.page * list.pageSize}
              isLoading={list.isLoading}
              isFiltered={list.isFiltered}
              itemLabel={(author) => author.fullName ?? `tác giả #${author.id}`}
              empty={{
                icon: <PenLine className="w-6 h-6" />,
                title: "Chưa có tác giả nào",
                description: "Thêm tác giả để gán cho sách khi tạo hoặc sửa sách",
                createLabel: "Thêm tác giả",
              }}
              filteredEmptyTitle="Không có tác giả nào khớp từ khóa"
              onCreate={() => setEditing(null)}
              onClearSearch={list.clearSearch}
              onEdit={setEditing}
              onDelete={setDeleting}
            />
          </div>

          {!list.isLoading && list.items.length > 0 && (
            <div className="flex-shrink-0 px-4 py-3 border-t border-border">
              <Pagination page={list.page} totalPage={list.totalPage} onPageChange={list.setPage} className="" />
            </div>
          )}
        </div>
      </div>

      {editing !== undefined && (
        <AuthorModal
          key={editing?.id ?? "new"}
          author={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={handleSaved}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa tác giả"
        itemName={deleting?.fullName}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};
