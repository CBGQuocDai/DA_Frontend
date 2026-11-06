"use client";

import { useState } from "react";
import { ChevronDown, Search, SearchX, X } from "lucide-react";
import { CustomerLayout } from "@/src/presentation/layouts";
import { AuthorCard } from "@/src/presentation/components/customer/authors/AuthorCard";
import { AuthorCardSkeleton } from "@/src/presentation/components/customer/authors/AuthorCardSkeleton";
import { ErrorState, Pagination } from "@/src/presentation/components/common";
import { useAuthorList } from "@/src/presentation/hooks/customer/useAuthorList";
import type { CustomerAuthorSort } from "@/src/shared/types";

const PAGE_SIZE = 8;
const GRID_CLASS =
  "grid grid-cols-1 gap-5 min-[420px]:grid-cols-2 lg:grid-cols-4 lg:gap-6";

export const CustomerAuthorsPage = () => {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CustomerAuthorSort>("name_asc");
  const {
    authors,
    total,
    totalPage,
    page,
    isLoading,
    error,
    goToPage,
    reload,
  } = useAuthorList(query, sort, PAGE_SIZE);

  return (
    <CustomerLayout>
      <div className="pb-10 sm:pb-14">
        <section
          aria-labelledby="authors-title"
          className="pb-9 pt-5 text-center sm:pb-10 sm:pt-8"
        >
          <h1
            id="authors-title"
            className="text-3xl font-extrabold uppercase tracking-tight text-slate-900 sm:text-4xl"
          >
            Tác giả
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
            Danh sách các tác giả tiêu biểu và toàn bộ tác phẩm sách nói chọn
            lọc
          </p>
          <div
            role="search"
            aria-label="Tìm tác giả"
            className="mx-auto mt-6 flex max-w-xl items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/40 transition focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/5 sm:px-5"
          >
            <Search
              className="h-4.5 w-4.5 shrink-0 text-slate-400"
              aria-hidden="true"
            />
            <label htmlFor="author-search" className="sr-only">
              Tìm kiếm theo tên tác giả
            </label>
            <input
              id="author-search"
              type="search"
              autoComplete="off"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm kiếm theo tên tác giả..."
              className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Xóa tìm kiếm tác giả"
                className="rounded-full p-1 text-slate-400 hover:bg-accent-light hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            )}
          </div>
        </section>

        <section aria-label="Danh sách tác giả" aria-busy={isLoading}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-slate-200/80 pb-5">
            <p role="status" className="text-xs leading-5 text-slate-500">
              {isLoading ? (
                "Đang tải danh sách tác giả…"
              ) : error ? (
                "Danh sách tác giả"
              ) : (
                <>
                  Hiển thị{" "}
                  <span className="font-semibold text-slate-700">
                    {total > 0
                      ? `${page * PAGE_SIZE + 1}–${page * PAGE_SIZE + authors.length} / ${total}`
                      : "0"}
                  </span>{" "}
                  tác giả{query.trim() ? ` cho “${query.trim()}”` : ""}
                </>
              )}
            </p>
            <div className="flex items-center gap-2 sm:gap-3">
              <label
                htmlFor="author-sort"
                className="text-xs font-medium text-slate-500"
              >
                Sắp xếp:
              </label>
              <div className="relative">
                <select
                  id="author-sort"
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as CustomerAuthorSort)
                  }
                  className="cursor-pointer appearance-none rounded-lg bg-transparent py-2 pl-2 pr-7 text-xs font-semibold text-slate-800 outline-none hover:text-accent focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <option value="name_asc">Tên A – Z</option>
                  <option value="book_count_desc">Nhiều sách nói nhất</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-1 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : isLoading ? (
            <div className={GRID_CLASS}>
              {Array.from({ length: PAGE_SIZE }, (_, index) => (
                <AuthorCardSkeleton key={index} />
              ))}
            </div>
          ) : authors.length > 0 ? (
            <div className={GRID_CLASS}>
              {authors.map((author) => (
                <AuthorCard key={author.id} author={author} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-16 text-center">
              <SearchX
                className="mx-auto h-10 w-10 text-slate-300"
                aria-hidden="true"
              />
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                {query.trim() ? "Không tìm thấy tác giả" : "Chưa có tác giả"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                {query.trim()
                  ? "Thử tìm bằng tên khác hoặc bỏ dấu tiếng Việt."
                  : "Danh sách tác giả sẽ được cập nhật tại đây."}
              </p>
              {query.trim() && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="mt-5 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
                >
                  Xem tất cả tác giả
                </button>
              )}
            </div>
          )}
          {!isLoading && !error && totalPage > 1 && (
            <Pagination
              page={page}
              totalPage={totalPage}
              onPageChange={goToPage}
            />
          )}
        </section>
      </div>
    </CustomerLayout>
  );
};
