"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/src/presentation/hooks";

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Đóng dropdown tài khoản khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Tự động focus vào ô tìm kiếm khi mở
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/customer/store?search=${encodeURIComponent(searchQuery.trim())}`,
      );
      setIsSearchOpen(false);
    }
  };

  const navLinks = [
    { label: "Sách nói", href: "/customer/store" },
    { label: "Tác giả", href: "/customer/authors" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900 selection:bg-rose-600 selection:text-white">
      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo & Navigation */}
          <div className="flex items-center gap-8 md:gap-10">
            {/* Logo */}
            <Link
              href="/customer"
              className="flex items-center gap-2 group select-none flex-shrink-0"
            >
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">
                  AudioBook
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-7">
              {navLinks.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`text-sm font-semibold transition-colors duration-200 ${
                      isActive
                        ? "text-rose-600 font-bold"
                        : "text-slate-600 hover:text-rose-600"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Search & Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Search Bar / Icon */}
            <div className="relative">
              {isSearchOpen ? (
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center bg-slate-50 border border-slate-300 rounded-full px-3 py-1.5 w-60 sm:w-72 shadow-sm focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-500/10 transition-all"
                >
                  <svg
                    className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0"
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
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm sách nói, truyện audio..."
                    className="w-full bg-transparent text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setIsSearchOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 ml-1"
                    aria-label="Đóng tìm kiếm"
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
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  aria-label="Tìm kiếm"
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
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="p-1.5 rounded-full text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center focus:outline-none"
                aria-label="Tài khoản"
              >
                {mounted && isAuthenticated && user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-rose-500/50"
                  />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.8}
                      d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                )}
              </button>

              {/* Dropdown Menu */}
              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-xl shadow-xl shadow-slate-200/60 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
                  {mounted && isAuthenticated && user ? (
                    <>
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="font-semibold text-slate-900 truncate">
                          {user.fullName || "Người dùng"}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {user.email}
                        </p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold rounded bg-rose-50 text-rose-600 border border-rose-200">
                          {user.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          href="/customer/profile"
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <svg
                            className="w-4 h-4 text-slate-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                          </svg>
                          Hồ sơ cá nhân
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link
                            href="/admin"
                            onClick={() => setIsProfileOpen(false)}
                            className="flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium"
                          >
                            <svg
                              className="w-4 h-4 text-rose-500"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                            Khu vực Quản trị
                          </Link>
                        )}
                      </div>
                      <div className="pt-1 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={async () => {
                            await logout();
                            setIsProfileOpen(false);
                            router.push("/login");
                          }}
                          className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-colors font-medium"
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
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Đăng xuất
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 space-y-1.5">
                      <Link
                        href="/login"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors shadow-md shadow-rose-600/20"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center justify-center w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
                      >
                        Đăng ký tài khoản
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Hamburger Toggle Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:text-rose-600 hover:bg-slate-100 transition-colors"
              aria-label="Menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg">
            {navLinks.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 px-3 text-sm font-semibold text-slate-700 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Customer Footer (Đồng bộ theo tông màu sáng sang trọng) */}
      <footer className="bg-white text-slate-500 text-sm mt-auto border-t border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Cột 1: Thông tin pháp lý & Logo */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5">
                <span className="text-2xl font-black text-slate-900 lowercase">
                  AudioBook
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white rounded-[4px] shadow-sm shadow-rose-600/30">
                  AUDIO
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Đơn vị chủ quản: Nền tảng Sách nói & Truyện Audio trực tuyến
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Đăng ký kinh doanh số: 0106165108-011 cấp ngày 10/07/2023.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Địa chỉ: Tầng 4, Tòa nhà Grandeur, 138B Giảng Võ, Ba Đình, Hà
                Nội.
              </p>
              <p className="text-[11px] leading-relaxed text-slate-500">
                Giấy xác nhận ĐKKD hoạt động phát hành xuất bản phẩm điện tử số
                41/XN-CXBIPH do Cục Xuất bản, In và Phát hành cấp ngày
                05/07/2023.
              </p>
            </div>

            {/* Cột 2: Thông tin hữu ích */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-3.5">
                Thông tin hữu ích
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link
                    href="/customer"
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Về chúng tôi
                  </Link>
                </li>
                <li>
                  <Link
                    href="/customer/store"
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Sách nói
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Tiêu chuẩn nội dung
                  </a>
                </li>
              </ul>
            </div>

            {/* Cột 3: Liên hệ */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-3.5">
                Liên hệ
              </h4>
              <div className="space-y-2.5 text-xs">
                {/* Red Hotline Pill */}
                <div>
                  <a
                    href="tel:19006868"
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/20 transition-all hover:scale-105"
                  >
                    <span>📞</span>
                    <span>1900 6868</span>
                  </a>
                </div>
                <p className="text-slate-500">Email: cskh@audiobook.vn</p>
                <p className="text-slate-500">Hotline: 1900 6868</p>
                {/* Social icons */}
                <div className="flex items-center gap-2.5 pt-2">
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                    aria-label="Messenger"
                  >
                    💬
                  </a>
                  <a
                    href="#"
                    className="w-8 h-8 rounded-full bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center text-xs font-bold transition-all shadow-sm"
                    aria-label="Zalo"
                  >
                    Z
                  </a>
                </div>
              </div>
            </div>

            {/* Cột 4: Tải App với QR code */}
            <div>
              <h4 className="text-slate-900 font-bold text-sm mb-3.5">
                Tải App
              </h4>
              <p className="text-xs text-slate-500 mb-2.5">
                Quét mã QR để tải APP
              </p>
              {/* QR Code Container */}
              <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                {/* Stylized QR Matrix Pattern */}
                <svg
                  className="w-full h-full text-slate-800"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm6 6h2v2h-2v-2zm-2-2h2v2h-2v-2zm-4 4h4v2h-4v-2zm2-4h2v2h-2v-2z" />
                </svg>
                {/* Center Audio Logo inside QR */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black shadow-md">
                    🎧
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
            <p>© 2026 AudioBook. Tất cả các quyền được bảo lưu.</p>
            <p>Đồ án tốt nghiệp - Nền tảng Audio trực tuyến</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
