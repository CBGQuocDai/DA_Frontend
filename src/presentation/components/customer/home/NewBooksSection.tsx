"use client";

import React from "react";
import { useBookList } from "@/src/presentation/hooks/customer";
import { BookShelf } from "../book";
import { ErrorState } from "@/src/presentation/components/common";
import { ROUTES } from "@/src/shared/constants";

const PAGE_SIZE = 10;

export const NewBooksSection: React.FC = () => {
  const { books, isLoading, error, reload } =
    useBookList({
      pageSize: PAGE_SIZE,
    });

  if (error) {
    return (
      <section>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
          Sách mới
        </h2>
        <ErrorState message={error} onRetry={reload} />
      </section>
    );
  }

  return (
    <div>
      <BookShelf
        title="Sách mới"
        books={books}
        isLoading={isLoading}
        viewAllHref={`${ROUTES.CUSTOMER.STORE}?view=all`}
        emptyMessage="Chưa có sách nào trong danh sách"
      />
    </div>
  );
};
