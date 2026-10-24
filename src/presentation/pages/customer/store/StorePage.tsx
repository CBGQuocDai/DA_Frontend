"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { bookService } from "@/src/infrastructure/api/services";
import { Book, Category } from "@/src/shared/types";

// Fallback bìa sách đồ họa nếu sách chưa có coverImage từ GCS
const renderStoreCover = (title: string, author?: string) => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-100 via-rose-50/40 to-slate-200 text-slate-800 p-3 flex flex-col justify-between select-none border border-slate-200">
      <div className="text-center pt-1 text-[8px] font-bold text-slate-500 uppercase tracking-wider truncate">
        {author || "Sách nói"}
      </div>
      <div className="my-auto text-center px-1">
        <div className="text-2xl mb-1.5">🎧📖</div>
        <div className="font-bold text-xs text-slate-900 leading-snug line-clamp-2">
          {title}
        </div>
      </div>
      <div className="text-center pb-0.5 text-[8px] text-rose-600 font-semibold uppercase tracking-wider">
        Audio Bản Quyền
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT CHÍNH: CUSTOMER STORE PAGE (TRANG SÁCH NÓI)
// ============================================================================

export const CustomerStorePage: React.FC = () => {
  const searchParams = useSearchParams();
  const selectedCategoryId = searchParams.get("category") || "";

  const [activeTab, setActiveTab] = useState<string>(
    selectedCategoryId || "all",
  );

  // Danh sách thể loại từ BE
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Sách theo từng danh mục: { [categoryId: string]: { books: Book[], isLoading: boolean, total: number } }
  const [booksByCategory, setBooksByCategory] = useState<{
    [categoryId: string]: {
      books: Book[];
      isLoading: boolean;
      total: number;
    };
  }>({});

  // Quản lý ref cuộn ngang cho từng hàng kệ sách
  const rowRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const scrollCategoryRow = (
    categoryId: string,
    direction: "left" | "right",
  ) => {
    const el = rowRefs.current[categoryId];
    if (el) {
      const scrollAmount = direction === "left" ? -340 : 340;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  // Cuộn trang mượt mà tới danh mục khi nhấn tab ở trên
  const scrollToCategory = (categoryId: string) => {
    setActiveTab(categoryId);
    if (categoryId === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const sectionEl = document.getElementById(`category-${categoryId}`);
    if (sectionEl) {
      const yOffset = -85; // Bù trừ chiều cao header sticky
      const y =
        sectionEl.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // 1. Tải danh mục và sách theo từng danh mục từ Backend
  const loadCategoriesAndBooks = async () => {
    setIsCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const catList = await bookService.getCategories();
      setCategories(catList);

      // Khởi tạo trạng thái loading cho từng danh mục
      const initialMap: typeof booksByCategory = {};
      catList.forEach((c) => {
        initialMap[c.id] = { books: [], isLoading: true, total: 0 };
      });
      setBooksByCategory(initialMap);

      // Gọi API lấy sách theo từng category song song
      catList.forEach(async (cat) => {
        try {
          const res = await bookService.getBooksByCategory(cat.id, {
            page: 1,
            pageSize: 10,
          });
          setBooksByCategory((prev) => ({
            ...prev,
            [cat.id]: {
              books: res.data,
              isLoading: false,
              total: res.total,
            },
          }));
        } catch {
          setBooksByCategory((prev) => ({
            ...prev,
            [cat.id]: {
              books: [],
              isLoading: false,
              total: 0,
            },
          }));
        }
      });
    } catch (err: any) {
      setCategoriesError(err?.message || "Không thể tải danh sách danh mục");
    } finally {
      setIsCategoriesLoading(false);
    }
  };

  useEffect(() => {
    loadCategoriesAndBooks();
  }, []);

  return (
    <div className="space-y-10 pb-16 selection:bg-rose-600 selection:text-white">
      {/* ===================================================================== */}
      {/* 1. TIÊU ĐỀ TRANG VÀ THANH LỌC DANH MỤC NHANH                           */}
      {/* ===================================================================== */}
      <section className="pt-2">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Sách nói
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Thưởng thức các tác phẩm audio bản quyền chất lượng cao cùng giọng
              đọc truyền cảm
            </p>
          </div>
        </div>

        {/* Thanh Jump Tag danh mục cuộn ngang */}
        <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none mt-2">
          <button
            type="button"
            onClick={() => scrollToCategory("all")}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "all"
                ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            Tất cả danh mục
          </button>

          {categories.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => scrollToCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-sm shadow-rose-600/30"
                    : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300"
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ===================================================================== */}
      {/* 2. CÁC HÀNG DANH MỤC SÁCH NÓI (TỪ API BACKEND)                       */}
      {/* ===================================================================== */}

      {/* Loading State cho Categories */}
      {isCategoriesLoading && (
        <div className="space-y-10 sm:space-y-12">
          {[1, 2, 3].map((i) => (
            <div key={`cat-skeleton-${i}`} className="space-y-4">
              <div className="h-7 bg-slate-200 rounded w-48 animate-pulse" />
              <div className="flex items-stretch gap-4 sm:gap-5 overflow-hidden">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div
                    key={`book-skel-${j}`}
                    className="w-40 sm:w-48 md:w-52 flex-shrink-0 animate-pulse"
                  >
                    <div className="aspect-[3/4.2] w-full rounded-xl bg-slate-200 border border-slate-200" />
                    <div className="mt-2.5 space-y-1.5">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isCategoriesLoading && categoriesError && (
        <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center max-w-md mx-auto">
          <p className="text-sm text-rose-700 font-semibold mb-3">
            {categoriesError}
          </p>
          <button
            type="button"
            onClick={loadCategoriesAndBooks}
            className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 shadow-sm transition-colors"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty State khi chưa có danh mục */}
      {!isCategoriesLoading && !categoriesError && categories.length === 0 && (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8">
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-base font-bold text-slate-800">
            Chưa có danh mục sách nào
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Hiện tại hệ thống chưa có danh mục sách nào. Vui lòng quay lại sau!
          </p>
        </div>
      )}

      {/* Render các hàng kệ sách theo từng thể loại */}
      {!isCategoriesLoading && !categoriesError && categories.length > 0 && (
        <div className="space-y-10 sm:space-y-12">
          {categories.map((cat) => {
            const catData = booksByCategory[cat.id] || {
              books: [],
              isLoading: true,
              total: 0,
            };

            return (
              <section
                key={cat.id}
                id={`category-${cat.id}`}
                className="relative group/shelf"
              >
                {/* Category Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight hover:text-rose-600 transition-colors">
                      {cat.name}
                    </h2>
                    {!catData.isLoading && (
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {catData.total} cuốn
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Top Prev/Next scroll arrows */}
                    <div className="hidden sm:flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => scrollCategoryRow(cat.id, "left")}
                        className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-all"
                        aria-label="Cuộn trước"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => scrollCategoryRow(cat.id, "right")}
                        className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-all"
                        aria-label="Cuộn tiếp"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bookshelf Carousel Container */}
                <div className="relative">
                  {/* Category Loading Skeleton */}
                  {catData.isLoading ? (
                    <div className="flex items-stretch gap-4 sm:gap-5 overflow-hidden pb-3">
                      {[1, 2, 3, 4].map((j) => (
                        <div
                          key={`cat-book-skel-${j}`}
                          className="w-40 sm:w-48 md:w-52 flex-shrink-0 animate-pulse"
                        >
                          <div className="aspect-[3/4.2] w-full rounded-xl bg-slate-200 border border-slate-200" />
                          <div className="mt-2.5 space-y-1.5">
                            <div className="h-4 bg-slate-200 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 rounded w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : catData.books.length === 0 ? (
                    /* Category Empty State */
                    <div className="py-8 px-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
                      <p className="text-xs text-slate-500 font-medium">
                        Chưa có sách nào trong danh mục "{cat.name}"
                      </p>
                    </div>
                  ) : (
                    /* Horizontal Scroll Shelf với sách thật từ API */
                    <div
                      ref={(el) => {
                        rowRefs.current[cat.id] = el;
                      }}
                      className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-3 scrollbar-none snap-x snap-mandatory scroll-smooth"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {catData.books.map((book) => (
                        <Link
                          key={book.id}
                          href={`/customer/books/${book.id}`}
                          className="w-40 sm:w-48 md:w-52 flex-shrink-0 snap-start group cursor-pointer block"
                        >
                          {/* Book Cover Card */}
                          <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-md shadow-slate-200/90 group-hover:shadow-xl group-hover:shadow-rose-600/15 group-hover:scale-[1.03] transition-all duration-300 relative border border-slate-200/90 bg-white">
                            {book.coverImage ? (
                              <img
                                src={book.coverImage}
                                alt={book.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                              />
                            ) : (
                              renderStoreCover(book.title, book.author)
                            )}

                            {/* Top Badge: Trạng thái hoặc Miễn phí */}
                            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[9px] font-bold text-slate-800 border border-slate-200 shadow-sm">
                              {book.price === 0
                                ? "Miễn phí"
                                : book.status === "PUBLISHED"
                                  ? "Đã phát hành"
                                  : "Mới"}
                            </div>

                            {/* Audio Pill Bottom Left */}
                            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white flex items-center gap-1">
                              <span>🎧</span>
                              <span>
                                {book.price
                                  ? `${book.price.toLocaleString("vi-VN")} đ`
                                  : "Miễn phí"}
                              </span>
                            </div>
                          </div>

                          {/* Book Info Under Card */}
                          <div className="mt-2.5">
                            <div
                              className="text-xs sm:text-sm font-bold text-slate-900 truncate group-hover:text-rose-600 transition-colors"
                              title={book.title}
                            >
                              {book.title}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mt-0.5">
                              {book.author}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                              <span className="text-amber-500 font-bold">
                                ★ {book.rating || 5.0}
                              </span>
                              {book.category?.name && (
                                <>
                                  <span>•</span>
                                  <span className="truncate max-w-[100px] text-slate-500">
                                    {book.category.name}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Right Edge Floating Arrow Button (Chuẩn như ảnh mẫu) */}
                  {!catData.isLoading && catData.books.length > 3 && (
                    <button
                      type="button"
                      onClick={() => scrollCategoryRow(cat.id, "right")}
                      className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 z-20 w-9 h-9 rounded-full bg-white/95 hover:bg-rose-600 text-slate-700 hover:text-white border border-slate-200 shadow-lg shadow-slate-300/60 items-center justify-center transition-all opacity-0 group-hover/shelf:opacity-100 hover:scale-110 active:scale-95"
                      aria-label="Xem tiếp sách trong danh mục"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CustomerStorePage;
