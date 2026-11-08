"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";
import { AdminLayout } from "@/src/presentation/layouts";
import { categoryService } from "@/src/infrastructure/api/services";
import type { Category } from "@/src/shared/types";
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
  CatalogTable,
  CategoryModal,
  type CatalogColumn,
} from "@/src/presentation/components/admin/catalog";
import { invalidateBookFormOptions, useAdminSearchList } from "@/src/presentation/hooks/admin";

const columns: CatalogColumn<Category>[] = [
  {
    header: "Thể loại",
    className: "w-64",
    render: (category) => (
      <p className="text-sm font-semibold text-text-primary truncate" title={category.name}>
        {category.name}
      </p>
    ),
  },
  {
    header: "Mô tả",
    className: "text-xs text-text-secondary",
    render: (category) =>
      category.description ? (
        <p className="line-clamp-2 leading-relaxed max-w-xl" title={category.description}>
          {category.description}
        </p>
      ) : (
        <span className="italic text-text-muted">Chưa có mô tả</span>
      ),
  },
];

export const ManageCategoryPage = () => {
  const list = useAdminSearchList(categoryService.searchCategories);
  // `undefined` = closed, `null` = creating, Category = editing
  const [editing, setEditing] = useState<Category | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSaved = () => {
    invalidateBookFormOptions();
    list.reload();
  };

  const handleConfirmDelete = async () => {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await categoryService.deleteCategory(deleting.id);
      invalidateBookFormOptions();
      setDeleting(null);
      list.reload();
    } catch (error) {
      console.error("Error deleting category:", error);
      setDeleting(null);
      showAlert(getApiErrorMessage(error, "Không xóa được thể loại, thử lại sau"));
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
              placeholder="Tìm theo tên hoặc mô tả..."
              className="flex-1 max-w-md"
            />
            {!list.isLoading && (
              <span className="hidden sm:inline text-xs text-text-muted tabular-nums" aria-live="polite">
                {list.total} thể loại
              </span>
            )}
          </div>
          <Button onClick={() => setEditing(null)} className="h-10 px-4 rounded-xl shadow-sm hover:shadow">
            <Plus className="w-4 h-4" />
            <span>Thêm thể loại</span>
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
              itemLabel={(category) => category.name}
              empty={{
                icon: <Tags className="w-6 h-6" />,
                title: "Chưa có thể loại nào",
                description: "Thêm thể loại để phân loại sách trong cửa hàng",
                createLabel: "Thêm thể loại",
              }}
              filteredEmptyTitle="Không có thể loại nào khớp từ khóa"
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
        <CategoryModal
          key={editing?.id ?? "new"}
          category={editing}
          onClose={() => setEditing(undefined)}
          onSuccess={handleSaved}
        />
      )}

      <ConfirmDeleteModal
        isOpen={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa thể loại"
        itemName={deleting?.name}
        isLoading={isDeleting}
      />
    </AdminLayout>
  );
};
