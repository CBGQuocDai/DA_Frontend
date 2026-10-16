"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isRegister = pathname === "/register";
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-rose-600 selection:text-white">
      {/* Top Navbar Header (Giống Image 2) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <Link
            href="/customer"
            className="flex items-center gap-2 group select-none flex-shrink-0"
          >
            <div className="flex items-center">
              <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">
                AudioBook
              </span>
              {/* <span className="ml-1.5 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-[4px] shadow-sm shadow-rose-600/30">
                AUDIO
              </span> */}
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/customer"
              className="hover:text-rose-600 transition-colors"
            >
              Trang chủ
            </Link>
            <Link
              href="/customer/store"
              className="hover:text-rose-600 transition-colors"
            >
              Sách nói
            </Link>
            <Link
              href="/customer/store?category=truyen-audio"
              className="hover:text-rose-600 transition-colors"
            >
              Truyện audio
            </Link>
            <Link
              href="/customer/store?tab=rankings"
              className="hover:text-rose-600 transition-colors"
            >
              Bảng xếp hạng
            </Link>
            <Link
              href="/customer/store?tab=albums"
              className="hover:text-rose-600 transition-colors"
            >
              Album
            </Link>
          </nav>

          {/* Right Action Icons & Button */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Icon */}
            <Link
              href="/customer/store"
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-colors"
              aria-label="Tìm kiếm"
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </Link>

            {/* Nút Đăng nhập / Đăng ký */}
            <Link
              href={isRegister ? "/login" : "/register"}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-md shadow-rose-600/20 active:scale-95"
            >
              {isRegister ? "Đăng nhập" : "Đăng ký"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area: Centered Sign-in Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-7 sm:p-9">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
