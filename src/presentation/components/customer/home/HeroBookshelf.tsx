"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Headphones } from "lucide-react";
import { ROUTES } from "@/src/shared/constants";
import { getBookAuthorNames } from "@/src/shared/utils";
import { useBookList } from "@/src/presentation/hooks/customer/useBookList";
import { BookCover } from "../book/BookCover";
import styles from "./HeroBookshelf.module.css";

const arrowClass =
  "absolute z-30 flex h-11 w-11 items-center justify-center rounded-full border border-rose-100 bg-white text-accent shadow-md shadow-rose-900/5 transition-colors hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent sm:h-12 sm:w-12";

/** Five newest published books; the active cover and its neighbours are visible. */
export const HeroBookshelf: React.FC = () => {
  const headingId = useId();
  const { books, isLoading, error, reload } = useBookList({ pageSize: 5 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const count = books.length;
  const centerIndex = selectedIndex < count ? selectedIndex : 0;
  const canMove = !isLoading && !error && count > 1;
  const move = (direction: number) => {
    if (canMove) setSelectedIndex((centerIndex + direction + count) % count);
  };

  const slotOf = (index: number) => {
    if (index === centerIndex) return "center";
    // With two books, show the other book once, on the right.
    if (count > 2 && index === (centerIndex - 1 + count) % count) return "left";
    if (index === (centerIndex + 1) % count) return "right";
    return null;
  };

  return (
    <section
      aria-labelledby={headingId}
      aria-roledescription="Băng chuyền sách"
      className={`${styles.hero} relative isolate overflow-hidden rounded-3xl pt-10 pb-8 sm:pt-12 sm:pb-10`}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-28 left-[8%] -z-10 h-44 w-44 rounded-full bg-accent/4 sm:left-[14%] sm:h-56 sm:w-56"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-20 right-[7%] -z-10 h-52 w-52 rounded-full bg-accent/4 sm:right-[12%] sm:h-72 sm:w-72"
      />

      <div className="relative z-10 px-4 text-center">
        <h1
          id={headingId}
          className="mt-5 text-4xl leading-[1.1] font-black tracking-tight text-slate-900 uppercase sm:text-5xl lg:text-[57px]"
        >
          Sách
          <br />
          Cho <span className="text-accent">mọi người</span>
        </h1>
        <p className="mt-3 text-xs leading-6 text-slate-500 sm:text-sm">
          Mỗi cuốn sách, một hành trình mới đang chờ bạn
        </p>
      </div>

      <div
        className={`${styles.stage} relative mx-auto mt-6 w-full max-w-[1040px]`}
        aria-busy={isLoading}
      >
        {(isLoading || (!error && count > 0)) && (
          <div aria-hidden="true" className={styles.shelf} />
        )}
        {isLoading ? (
          <div role="status" className="absolute inset-0">
            <span className="sr-only">Đang tải sách nổi bật…</span>
            {(["left", "center", "right"] as const).map((slot) => (
              <div
                key={slot}
                aria-hidden="true"
                className={`${styles.book} ${styles[slot]} overflow-hidden`}
              >
                <div className="h-full w-full animate-pulse bg-gradient-to-br from-white via-rose-100 to-slate-100 motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div
            role="alert"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center"
          >
            <p className="text-sm text-slate-500">{error}</p>
            <button
              type="button"
              onClick={reload}
              className="rounded-full border border-rose-200 bg-white px-5 py-2.5 text-sm font-semibold text-accent hover:bg-accent-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              Thử lại
            </button>
          </div>
        ) : count === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
            <Headphones
              aria-hidden="true"
              className="h-10 w-10 text-rose-300"
            />
            <p className="text-sm">Chưa có sách để hiển thị.</p>
          </div>
        ) : (
          <div className="absolute inset-0">
            {books.map((book, index) => {
              const slot = slotOf(index);
              return (
                <Link
                  key={book.id}
                  href={ROUTES.CUSTOMER.BOOK_DETAIL(book.id)}
                  aria-label={`${slot === "center" ? "Xem sách" : "Chọn sách"} ${book.title}`}
                  aria-hidden={!slot || undefined}
                  tabIndex={slot ? 0 : -1}
                  className={`${styles.book} ${styles[slot ?? "hidden"]} focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-accent`}
                  onClick={(event) => {
                    if (index !== centerIndex) {
                      event.preventDefault();
                      setSelectedIndex(index);
                    }
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="h-full w-full overflow-hidden rounded-xl"
                  >
                    <BookCover
                      title={book.title}
                      author={getBookAuthorNames(book)}
                      coverImage={book.coverImage?.url}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {canMove && (
          <>
            <button
              type="button"
              onClick={() => move(-1)}
              className={`${arrowClass} ${styles.previous}`}
              aria-label="Sách trước"
            >
              <ChevronLeft aria-hidden="true" className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              className={`${arrowClass} ${styles.next}`}
              aria-label="Sách kế tiếp"
            >
              <ChevronRight aria-hidden="true" className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};
