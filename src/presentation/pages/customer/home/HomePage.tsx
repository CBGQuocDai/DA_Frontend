"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useBooks } from "@/src/presentation/hooks";

// ===== Data for Hero 3D Bookshelf =====
const HERO_BOOKS = [
  {
    id: "hero-1",
    title: "Những Đòn Tâm Lý Trong Thuyết Phục",
    subtitle: "Influence: The Psychology of Persuasion",
    author: "Robert B. Cialdini",
    type: "psychology",
    coverBg: "bg-[#f7f6f2]",
  },
  {
    id: "hero-2",
    title: "Y Học Dinh Dưỡng",
    subtitle: "Những điều bác sĩ không nói với bạn",
    author: "Bác sĩ Ray D. Strand",
    type: "nutrition",
    coverBg: "bg-white",
    isSpotlight: true,
  },
  {
    id: "hero-3",
    title: "Mật Mã Đen",
    subtitle: "Hacker vĩ đại nhất mọi thời đại",
    author: "Nicholas Eftimiades",
    type: "cyber",
    coverBg: "bg-[#0f0e17]",
  },
];

export const CustomerHomePage: React.FC = () => {
  // Hero shelf navigation state (which book is in center spotlight)
  const [heroIndex, setHeroIndex] = useState(1);

  // Fetch book list with pagination from Backend API
  const {
    books: apiBooks,
    isLoading: isBooksLoading,
    error: booksError,
    pagination,
    goToPage,
    refresh: refreshBooks,
  } = useBooks({ page: 1, pageSize: 8 });

  // References for horizontal scrolling rows
  const newBooksRef = useRef<HTMLDivElement>(null);

  const scrollRow = (
    ref: React.RefObject<HTMLDivElement | null>,
    direction: "left" | "right",
  ) => {
    if (ref.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % HERO_BOOKS.length);
  };

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + HERO_BOOKS.length) % HERO_BOOKS.length);
  };

  // Helper to render book cover graphics with high-fidelity detail
  const renderCoverVisual = (type: string, title: string, author?: string) => {
    switch (type) {
      // 1. Hero Robert Cialdini
      case "psychology":
        return (
          <div className="w-full h-full bg-[#f8f6f0] text-slate-800 p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-200/80">
            <div className="text-center pt-2">
              <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase block">
                Robert B. Cialdini
              </span>
              <span className="text-[7px] text-slate-400 italic block">
                Influence: The Psychology of Persuasion
              </span>
            </div>
            {/* Minimalist silhouettes of two heads exchanging thoughts */}
            <div className="my-auto flex items-center justify-center gap-2">
              <div className="w-9 h-11 bg-blue-500 rounded-t-full rounded-bl-full flex items-center justify-center text-[10px] text-white shadow-sm">
                🧠
              </div>
              <div className="w-4 h-0.5 bg-slate-300"></div>
              <div className="w-9 h-11 bg-amber-400 rounded-t-full rounded-br-full flex items-center justify-center text-[10px] text-white shadow-sm">
                💡
              </div>
            </div>
            <div className="text-center pb-2">
              <span className="text-[12px] font-black uppercase text-slate-900 leading-tight block">
                Những Đòn Tâm Lý
              </span>
              <span className="text-[9px] font-extrabold uppercase text-amber-600 block mt-0.5">
                Trong Thuyết Phục
              </span>
            </div>
          </div>
        );

      // 2. Hero Y Học Dinh Dưỡng
      case "nutrition":
        return (
          <div className="w-full h-full bg-white text-slate-800 p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-200">
            {/* Top Author */}
            <div className="text-center pt-1 border-b border-slate-100 pb-1">
              <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase block">
                Bác Sĩ Ray D. Strand
              </span>
              <span className="text-[8px] text-slate-400 block">
                Nguyễn Trung dịch
              </span>
            </div>

            {/* Heart composed of fresh produce */}
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-rose-500/10 flex items-center justify-center p-2 shadow-inner">
                <span className="text-4xl filter drop-shadow">🥦🍎🥕🍇</span>
              </div>
            </div>

            {/* Title Badge & Subtitle */}
            <div className="text-center pb-1">
              <div className="bg-emerald-600 text-white font-black text-[12px] uppercase py-1 px-2 rounded tracking-wide shadow-sm mb-1">
                Y Học Dinh Dưỡng
              </div>
              <span className="text-[9px] font-bold text-slate-700 leading-tight block">
                Những điều bác sĩ không nói với bạn
              </span>
            </div>
          </div>
        );

      // 3. Hero Mật Mã Đen
      case "cyber":
        return (
          <div className="w-full h-full bg-[#0a0911] text-white p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-800">
            <div className="text-center pt-2">
              <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">
                Bestseller Công Nghệ
              </span>
            </div>
            {/* Glowing fingerprint matrix */}
            <div className="my-auto flex items-center justify-center">
              <div className="relative w-20 h-24 rounded-full border border-amber-500/30 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent animate-pulse" />
                <span className="text-4xl text-amber-400/80">🧬</span>
              </div>
            </div>
            <div className="text-center pb-2">
              <span className="text-[14px] font-black uppercase text-amber-400 tracking-wider block drop-shadow">
                Mật Mã Đen
              </span>
              <span className="text-[8px] text-slate-400 tracking-wide block mt-0.5">
                Hacker Vĩ Đại Nhất
              </span>
            </div>
          </div>
        );

      // 4. Detective Noir "Cuộc đời tôi phá án"
      case "detective":
        return (
          <div className="w-full h-full bg-[#0e0a0d] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden border border-red-950">
            {/* Red isometric geometric maze background */}
            <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#e11d48_1px,transparent_1px)] [background-size:8px_8px]" />
            <div className="relative z-10 text-center pt-2">
              <span className="text-[12px] font-black uppercase text-rose-500 tracking-wider block leading-tight">
                Cuộc Đời Tôi
              </span>
              <span className="text-[14px] font-black uppercase text-white tracking-widest block drop-shadow-md">
                Phá Án
              </span>
            </div>
            {/* Detective silhouette */}
            <div className="relative z-10 my-auto flex justify-center">
              <span className="text-4xl filter drop-shadow">🕵️‍♂️</span>
            </div>
            <div className="relative z-10 text-center pb-1">
              <span className="text-[9px] text-slate-300 font-medium block">
                {author}
              </span>
            </div>
          </div>
        );

      // 5. "Để thanh thản khi về già"
      case "aging":
        return (
          <div className="w-full h-full bg-[#eef5ee] text-slate-800 p-3 flex flex-col justify-between select-none relative overflow-hidden border border-emerald-100">
            <div className="text-center pt-2">
              <span className="text-[11px] font-bold text-emerald-900 block leading-tight">
                Để thanh thản
              </span>
              <span className="text-[13px] font-black text-emerald-700 block">
                khi về già
              </span>
            </div>
            {/* Couple on bench */}
            <div className="my-auto flex flex-col items-center justify-center">
              <div className="w-16 h-12 bg-emerald-700/10 rounded-full flex items-center justify-center text-2xl mb-1">
                👴👵
              </div>
              <span className="px-1.5 py-0.5 bg-amber-400 text-amber-950 font-black text-[7px] uppercase rounded-full shadow-sm">
                Bestseller Hàn Quốc
              </span>
            </div>
            <div className="text-center pb-1">
              <span className="text-[9px] font-bold text-slate-700 tracking-wide block uppercase">
                {author}
              </span>
            </div>
          </div>
        );

      // 6. "Fadette"
      case "fadette":
        return (
          <div className="w-full h-full bg-[#0a231b] text-amber-200 p-3 flex flex-col justify-between select-none relative overflow-hidden border-2 border-amber-600/40">
            {/* Filigree corner decorations */}
            <div className="absolute inset-1 border border-amber-500/30 rounded" />
            <div className="relative z-10 text-center pt-2">
              <span className="text-[13px] font-serif font-black tracking-widest uppercase text-amber-300 block">
                FADETTE
              </span>
              <span className="text-[8px] italic text-amber-200/70 block">
                George Sand
              </span>
            </div>
            {/* Illustrated oval portrait */}
            <div className="relative z-10 my-auto flex justify-center">
              <div className="w-16 h-20 rounded-full border-2 border-amber-500/50 bg-[#13372c] flex items-center justify-center overflow-hidden shadow-inner">
                <span className="text-3xl">👒</span>
              </div>
            </div>
            <div className="relative z-10 text-center pb-1">
              <span className="text-[8px] uppercase tracking-wider text-amber-400 font-semibold block">
                Văn học kinh điển
              </span>
            </div>
          </div>
        );

      // 7. "Những quy tắc làm cha mẹ"
      case "parenting":
        return (
          <div className="w-full h-full bg-[#fced9a] text-slate-900 p-3 flex flex-col justify-between select-none relative overflow-hidden border border-yellow-300">
            <div className="text-center pt-2">
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-600 block">
                The Rules Of Parenting
              </span>
            </div>
            <div className="my-auto text-center px-1">
              <span className="text-[12px] font-black uppercase text-slate-900 leading-tight block">
                Những Quy Tắc
              </span>
              <span className="text-[14px] font-black uppercase text-amber-900 block mt-0.5">
                Làm Cha Mẹ
              </span>
              <div className="mt-3 flex justify-center text-2xl">👨‍👩‍👧</div>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] font-bold text-slate-700 uppercase block tracking-wider">
                {author}
              </span>
            </div>
          </div>
        );

      // 8. Nature book
      case "nature":
        return (
          <div className="w-full h-full bg-[#1b2b1e] text-emerald-100 p-3 flex flex-col justify-between select-none relative overflow-hidden">
            <div className="text-center pt-2">
              <span className="text-[11px] font-bold text-emerald-200 block">
                {title}
              </span>
            </div>
            <div className="my-auto flex justify-center text-3xl">🌳</div>
            <div className="text-center pb-1">
              <span className="text-[8px] text-emerald-300 block">
                {author}
              </span>
            </div>
          </div>
        );

      // 9. Lịch sử Việt Nam (Top 1)
      case "history":
        return (
          <div className="w-full h-full bg-[#fbf5e6] text-[#6b1e1e] p-3 flex flex-col justify-between select-none relative overflow-hidden border-2 border-[#b8860b]/40">
            {/* Antique decorative border */}
            <div className="absolute inset-1 border border-[#b8860b]/30 rounded-sm" />
            <div className="relative z-10 text-center pt-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700 block">
                Văn Học Dân Tộc
              </span>
            </div>
            <div className="relative z-10 my-auto text-center px-1">
              <span className="text-[10px] font-bold uppercase text-slate-800 block">
                Truyện đọc
              </span>
              <span className="text-[14px] font-serif font-black uppercase text-[#8b0000] leading-none block my-1">
                Lịch Sử
              </span>
              <span className="text-[13px] font-serif font-black uppercase text-[#8b0000] block">
                Việt Nam
              </span>
              <span className="text-[9px] font-bold text-[#b8860b] block mt-0.5">
                TẬP 1
              </span>
              <div className="mt-2 text-2xl">⚔️ 🛡️</div>
            </div>
            <div className="relative z-10 text-center pb-1 border-t border-[#b8860b]/20 pt-1">
              <span className="text-[8px] font-bold text-slate-700 block">
                NXB Kim Đồng
              </span>
            </div>
          </div>
        );

      // 10. Đắc Nhân Tâm (Top 2)
      case "dacnhantam":
        return (
          <div className="w-full h-full bg-[#b91c1c] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden border border-red-700 shadow-md">
            <div className="text-right pt-1">
              <span className="inline-block bg-yellow-400 text-red-950 font-black text-[7px] uppercase px-1.5 py-0.5 rounded-full shadow-sm">
                Đặc biệt
              </span>
            </div>
            <div className="my-auto text-center px-1">
              <span className="text-[18px] font-black uppercase tracking-tight block leading-none text-white drop-shadow">
                Đắc Nhân
              </span>
              <span className="text-[20px] font-black uppercase tracking-tight block leading-none text-white drop-shadow mt-1">
                Tâm
              </span>
              <span className="text-[8px] font-medium text-red-100 block mt-2 leading-tight">
                Nghệ thuật thu phục lòng người
              </span>
              <div className="mt-2 text-2xl">🤝</div>
            </div>
            <div className="text-center pb-1 border-t border-red-500/50 pt-1">
              <span className="text-[9px] font-bold tracking-wider uppercase text-yellow-300 block">
                {author}
              </span>
            </div>
          </div>
        );

      // 11. Biến Mọi Thứ Thành Tiền (Top 3)
      case "makemoney":
        return (
          <div className="w-full h-full bg-[#4a044e] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden border border-purple-800">
            <div className="text-center pt-1">
              <span className="text-[8px] font-semibold text-purple-200 uppercase block">
                {author}
              </span>
            </div>
            <div className="my-auto text-center px-1">
              <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider block">
                Biến
              </span>
              <span className="text-[13px] font-black uppercase text-white leading-tight block">
                Mọi Thứ Thành
              </span>
              <span className="text-[17px] font-black uppercase text-amber-400 tracking-wider block leading-none mt-1 drop-shadow-md">
                TIỀN
              </span>
              <div className="mt-2 text-2xl">💰 💎</div>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] font-bold text-amber-300/90 block">
                MAKE MONEY
              </span>
            </div>
          </div>
        );

      // 12. Tư Duy Tự Do (Top 4)
      case "freedom":
        return (
          <div className="w-full h-full bg-[#eab308] text-slate-900 p-3 flex flex-col justify-between select-none relative overflow-hidden border border-yellow-400">
            <div className="text-center pt-2">
              <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700 block">
                Tư Duy Đột Phá
              </span>
            </div>
            <div className="my-auto text-center px-1">
              <span className="text-[14px] font-black uppercase text-slate-900 block leading-tight">
                Tư Duy
              </span>
              <span className="text-[16px] font-black uppercase text-white bg-slate-900 px-1 py-0.5 rounded block mt-1">
                Tự Do
              </span>
              <div className="mt-2 text-2xl">✈️</div>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] font-bold text-slate-800 uppercase block">
                {author}
              </span>
            </div>
          </div>
        );

      // 13. Hành Trình Về Phương Đông (Top 5)
      case "eastjourney":
        return (
          <div className="w-full h-full bg-[#1e1b4b] text-indigo-100 p-3 flex flex-col justify-between select-none relative overflow-hidden border border-indigo-900">
            <div className="text-center pt-2">
              <span className="text-[11px] font-bold text-indigo-200 block">
                {title}
              </span>
            </div>
            <div className="my-auto flex justify-center text-3xl">🏔️ ☀️</div>
            <div className="text-center pb-1">
              <span className="text-[8px] text-indigo-300 block">{author}</span>
            </div>
          </div>
        );

      // 14. Free OSHO
      case "osho":
        return (
          <div className="w-full h-full bg-[#0284c7] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden">
            <div className="text-center pt-1">
              <span className="text-[16px] font-black tracking-widest uppercase text-white block drop-shadow">
                OSHO
              </span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center">
              <span className="text-4xl filter drop-shadow-lg">🦅</span>
            </div>
            <div className="text-center pb-1 bg-sky-900/40 p-1 rounded backdrop-blur-sm">
              <span className="text-[8px] font-bold text-sky-100 leading-tight block">
                Can Đảm Là Chính Mình Trong Thế Giới Hôm Nay
              </span>
            </div>
          </div>
        );

      // 15. Free Space
      case "space":
        return (
          <div className="w-full h-full bg-[#030712] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden border border-slate-800">
            <div className="text-center pt-1">
              <span className="text-[8px] text-slate-400 uppercase tracking-widest block">
                {author}
              </span>
            </div>
            <div className="my-auto flex flex-col items-center justify-center">
              <span className="text-4xl filter drop-shadow-md">👨‍🚀</span>
              <span className="text-[14px] font-black tracking-wider uppercase text-white mt-2 block">
                Right Stuff
              </span>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] text-slate-500 block">
                Vũ Trụ Vô Tận
              </span>
            </div>
          </div>
        );

      // 16. Free Marketing
      case "marketing":
        return (
          <div className="w-full h-full bg-[#f8fafc] text-slate-900 p-3 flex flex-col justify-between select-none relative overflow-hidden border border-slate-200">
            <div className="text-center pt-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase block">
                {author}
              </span>
            </div>
            <div className="my-auto text-center px-1">
              <span className="text-[12px] font-black uppercase text-teal-600 block leading-none">
                THEY ASK
              </span>
              <span className="text-[14px] font-black uppercase text-rose-500 block leading-tight">
                YOU
              </span>
              <span className="text-[16px] font-black uppercase text-indigo-600 block leading-none">
                ANSWER
              </span>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] font-bold text-slate-600 block">
                Kinh doanh hiện đại
              </span>
            </div>
          </div>
        );

      // 17. Free War
      case "war":
        return (
          <div className="w-full h-full bg-[#18181b] text-white p-3 flex flex-col justify-between select-none relative overflow-hidden border border-red-900/50">
            <div className="text-center pt-1">
              <span className="text-[8px] text-rose-400 font-medium block">
                {author}
              </span>
            </div>
            <div className="my-auto text-center">
              <span className="text-[11px] font-serif font-black tracking-wider uppercase text-rose-200 block">
                TASTES LIKE WAR
              </span>
              <div className="mt-2 text-3xl">🌺</div>
            </div>
            <div className="text-center pb-1">
              <span className="text-[8px] text-slate-400 block">
                Hồi ký xúc động
              </span>
            </div>
          </div>
        );

      default:
        return (
          <div className="w-full h-full bg-slate-800 text-white p-3 flex flex-col justify-between select-none">
            <div className="text-center font-bold text-xs">{title}</div>
            <div className="my-auto text-center text-3xl">📖</div>
            <div className="text-center text-[9px] text-slate-400">
              {author}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-14 md:space-y-16 pb-12 selection:bg-rose-600 selection:text-white">
      {/* ========================================================================= */}
      {/* 1. HERO 3D BOOKSHELF SECTION ("SÁCH CHO MỌI NGƯỜI")                      */}
      {/* ========================================================================= */}
      <section className="relative pt-6 pb-12 overflow-hidden">
        {/* Background Ambient Spotlights - Soft rose/purple aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-rose-200/35 via-pink-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* Section Heading */}
        <div className="text-center mb-8 sm:mb-12 relative z-10">
          {/* <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-rose-600 block mb-1">
            Khám phá không giới hạn
          </span> */}
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight uppercase">
            SÁCH
          </h1>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-800 tracking-tight uppercase mt-1">
            CHO MỌI NGƯỜI
          </h2>
        </div>

        {/* 3D Bookshelf & Books Stage */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          {/* Books Display */}
          <div className="relative z-10 flex items-end justify-center gap-3 sm:gap-6 md:gap-8 pb-3">
            {HERO_BOOKS.map((book, idx) => {
              const isCenter = idx === heroIndex;
              const isLeft =
                idx === (heroIndex - 1 + HERO_BOOKS.length) % HERO_BOOKS.length;
              const isRight = idx === (heroIndex + 1) % HERO_BOOKS.length;

              if (!isCenter && !isLeft && !isRight) return null;

              return (
                <Link
                  key={book.id}
                  href={`/customer/store?search=${encodeURIComponent(book.title)}`}
                  onClick={() => setHeroIndex(idx)}
                  className={`transition-all duration-500 ease-out flex-shrink-0 group ${
                    isCenter
                      ? "w-44 sm:w-56 md:w-64 h-64 sm:h-80 md:h-92 z-20 scale-105 sm:scale-110 -translate-y-2"
                      : isLeft
                        ? "w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-76 z-10 opacity-80 hover:opacity-100 scale-95 origin-bottom-right rotate-[-2deg]"
                        : "w-36 sm:w-44 md:w-52 h-52 sm:h-64 md:h-76 z-10 opacity-80 hover:opacity-100 scale-95 origin-bottom-left rotate-[2deg]"
                  }`}
                >
                  <div
                    className={`w-full h-full rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-[1.02] border border-slate-200/90 ${
                      isCenter
                        ? "ring-4 ring-rose-500/20 shadow-2xl shadow-rose-900/15"
                        : "shadow-lg shadow-slate-300/60"
                    }`}
                  >
                    {renderCoverVisual(book.type, book.title, book.author)}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* 3D Shelf Ledge Platform (Giá sách thiết kế sang trọng phong cách Light & Oak) */}
          <div className="relative w-full max-w-3xl mx-auto mt-[-10px] z-15">
            {/* Top Surface of the shelf */}
            <div className="h-4 sm:h-5 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 rounded-t-sm border-t border-white shadow-inner transform -perspective-500" />
            {/* Front Bevel Lip of the shelf */}
            <div className="h-3 sm:h-4 bg-gradient-to-r from-amber-200 via-amber-100 to-amber-200 border-t border-amber-300/40 shadow-xl" />
            {/* Ambient Drop Shadow beneath shelf */}
            <div className="h-6 w-[94%] mx-auto bg-slate-400/25 blur-xl rounded-full -mt-1" />
          </div>

          {/* Left Arrow Button */}
          <button
            type="button"
            onClick={handlePrevHero}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-rose-600 text-slate-700 hover:text-white backdrop-blur-md border border-slate-200 shadow-md transition-all active:scale-90"
            aria-label="Sách trước"
          >
            <svg
              className="w-5 h-5"
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

          {/* Right Arrow Button */}
          <button
            type="button"
            onClick={handleNextHero}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-rose-600 text-slate-700 hover:text-white backdrop-blur-md border border-slate-200 shadow-md transition-all active:scale-90"
            aria-label="Sách kế tiếp"
          >
            <svg
              className="w-5 h-5"
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
      </section>

      {/* ========================================================================= */}
      {/* 2. SECTION: "DANH SÁCH SÁCH" (Lấy từ API Backend, hỗ trợ phân trang)        */}
      {/* ========================================================================= */}
      <section className="relative">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Sách mới
            </h2>
            {pagination.total > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-200">
                {pagination.total} cuốn
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Page Summary */}
            {pagination.totalPages > 1 && (
              <span className="text-xs text-slate-500 font-medium">
                Trang{" "}
                <span className="text-slate-900 font-semibold">
                  {pagination.page}
                </span>{" "}
                / {pagination.totalPages}
              </span>
            )}

            {/* Carousel Scroll Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scrollRow(newBooksRef, "left")}
                className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-colors"
                aria-label="Cuộn trái"
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
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scrollRow(newBooksRef, "right")}
                className="p-1.5 rounded-full bg-white hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 shadow-sm transition-colors"
                aria-label="Cuộn phải"
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
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State: Skeleton */}
        {isBooksLoading && (
          <div className="flex items-stretch gap-4 sm:gap-5 overflow-x-hidden pb-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={`skeleton-${i}`}
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
        )}

        {/* Error State */}
        {!isBooksLoading && booksError && (
          <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-center">
            <p className="text-sm text-rose-700 font-medium mb-2">
              {booksError}
            </p>
            <button
              type="button"
              onClick={() => refreshBooks()}
              className="px-4 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isBooksLoading && !booksError && apiBooks.length === 0 && (
          <div className="py-12 px-4 rounded-xl border border-dashed border-slate-200 text-center bg-slate-50/50">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="text-sm font-semibold text-slate-700">
              Chưa có sách nào trong danh sách
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Vui lòng quay lại sau hoặc liên hệ quản trị viên.
            </p>
          </div>
        )}

        {/* Carousel Container (Dữ liệu thật từ API) */}
        {!isBooksLoading && !booksError && apiBooks.length > 0 && (
          <div
            ref={newBooksRef}
            className="flex items-stretch gap-4 sm:gap-5 overflow-x-auto pb-4 scrollbar-none snap-x snap-mandatory"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {apiBooks.map((book) => (
              <Link
                key={book.id}
                href={`/customer/books/${book.id}`}
                className="w-40 sm:w-48 md:w-52 flex-shrink-0 snap-start group cursor-pointer"
              >
                <div className="aspect-[3/4.2] w-full rounded-xl overflow-hidden shadow-md shadow-slate-200/80 group-hover:shadow-xl group-hover:shadow-rose-600/15 group-hover:scale-[1.03] transition-all duration-300 relative border border-slate-200/90 bg-slate-100">
                  {book.coverImage ? (
                    <img
                      src={book.coverImage}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    renderCoverVisual("default", book.title, book.author)
                  )}

                  {/* Top Badge: Trạng thái hoặc Miễn phí */}
                  {/* <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-white/95 backdrop-blur-sm text-[9px] font-bold text-slate-800 border border-slate-200/90 shadow-sm">
                    {book.price === 0
                      ? "Miễn phí"
                      : book.status === "PUBLISHED"
                        ? "Đã phát hành"
                        : "Mới cập nhật"}
                  </div> */}

                  {/* Audio Pill Bottom Left */}
                  <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[9px] font-medium text-white flex items-center gap-1">
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

        {/* Thanh Điều Hướng Phân Trang (Pagination Controls) */}
        {!isBooksLoading && pagination.totalPages > 1 && (
          <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Hiển thị{" "}
              <span className="font-semibold text-slate-800">
                {apiBooks.length}
              </span>{" "}
              / {pagination.total} cuốn
            </span>

            <div className="flex items-center gap-1">
              {/* Nút Trang Trước */}
              <button
                type="button"
                onClick={() => goToPage(pagination.page - 1)}
                disabled={pagination.page <= 1 || isBooksLoading}
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                ‹ Trước
              </button>

              {/* Các nút số trang */}
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1,
              ).map((p) => {
                const isActive = p === pagination.page;
                return (
                  <button
                    key={`page-btn-${p}`}
                    type="button"
                    onClick={() => goToPage(p)}
                    disabled={isBooksLoading}
                    className={`min-w-[28px] h-7 text-xs rounded-lg transition-colors font-medium ${
                      isActive
                        ? "bg-rose-600 text-white font-bold shadow-sm shadow-rose-200"
                        : "bg-white text-slate-700 hover:bg-rose-50 hover:text-rose-600 border border-slate-200"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              {/* Nút Trang Sau */}
              <button
                type="button"
                onClick={() => goToPage(pagination.page + 1)}
                disabled={
                  pagination.page >= pagination.totalPages || isBooksLoading
                }
                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-1"
              >
                Sau ›
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default CustomerHomePage;
