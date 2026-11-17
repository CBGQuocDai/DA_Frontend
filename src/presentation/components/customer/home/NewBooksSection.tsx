"use client";

import React from "react";
import { useHomeBooks } from "@/src/presentation/hooks/customer";
import { BookShelf } from "../book";
import { ErrorState } from "@/src/presentation/components/common";
import { ROUTES } from "@/src/shared/constants";

export const NewBooksSection: React.FC = () => {
  const { books, isGuest, isLoading, error, reload } = useHomeBooks();
  const title = isGuest ? "Khám phá sách" : "Sách mới";

  if (isGuest && !isLoading && !error && books.length === 0) return null;

  if (error) {
    return (
      <section aria-label={title} role="alert">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mb-5">
          {title}
        </h2>
        <ErrorState message={error} onRetry={reload} />
      </section>
    );
  }

  return (
    <div>
      <BookShelf
        title={title}
        books={books}
        isLoading={isLoading}
        viewAllHref={ROUTES.CUSTOMER.BOOKS}
        emptyMessage="Chưa có sách nào trong danh sách"
      />
    </div>
  );
};
