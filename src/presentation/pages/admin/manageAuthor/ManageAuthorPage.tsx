"use client";

import { useState } from "react";
import { PenLine, Plus } from "lucide-react";
import { AdminLayout } from "@/src/presentation/layouts";
import { authorService } from "@/src/infrastructure/api/services";
import type { Author } from "@/src/shared/types";
import {
  Button,
  ConfirmDeleteModal,
  ErrorState,
  Pagination,
  SearchInput,
} from "@/src/presentation/components/common";
import {
  AuthorAvatar,
  AuthorModal,
  CatalogTable,
  type CatalogColumn,
} from "@/src/presentation/components/admin/catalog";
import { invalidateBookFormOptions, useAdminSearchList, useDeleteConfirm } from "@/src/presentation/hooks/admin";

// Các cột riêng của bảng tác giả; cột số thứ tự và thao tác do CatalogTable lo
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

/** Trang quản lý tác giả: tìm kiếm, phân trang, thêm/sửa/xóa. */
export const ManageAuthorPage = () => {
  const list = useAdminSearchList(authorService.searchAuthors);
  // `undefined` = đóng modal, `null` = đang tạo mới, Author = đang sửa
  const [editing, setEditing] = useState<Author | null | undefined>(undefined);

  // Thêm/sửa/xóa đều làm thay đổi danh sách lựa chọn của form sách
  const handleChanged = () => {
    invalidateBookFormOptions();
    list.reload();
  };

  const deletion = useDeleteConfirm<Author>({
    remove: (author) => authorService.deleteAuthor(author.id),
    onDeleted: handleChanged,
    errorMessage: "Không xóa được tác giả, thử lại sau",
  });

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
              onDelete={deletion.ask}
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
          onSuccess={handleChanged}
        />
      )}

      <ConfirmDeleteModal
        isOpen={deletion.target !== null}
        onClose={deletion.cancel}
        onConfirm={deletion.confirm}
        title="Xóa tác giả"
        itemName={deletion.target?.fullName}
        isLoading={deletion.isDeleting}
      />
    </AdminLayout>
  );
};
