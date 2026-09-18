import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* Hiệu ứng ánh sáng nền (Glow Effect) */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Logo */}
      <div className="relative z-10 mb-8 text-center">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
            DA
          </div>
          <span className="text-2xl font-black tracking-tight text-white">
            Portal<span className="text-indigo-400">Auth</span>
          </span>
        </Link>
        <p className="text-xs sm:text-sm text-slate-400 mt-2">
          Xác thực an toàn & Quản lý phiên làm việc
        </p>
      </div>

      {/* Card Content Wrapper */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-2xl p-6 sm:p-8">
        {children}
      </div>

      {/* Footer Navigation */}
      <footer className="relative z-10 mt-8 text-center text-xs text-slate-500">
        <p>© 2026 DA Enterprise. Bảo mật thông tin đa lớp.</p>
        <div className="mt-2 flex justify-center gap-4 text-slate-400">
          <Link href="/" className="hover:text-indigo-400 transition-colors">Trang chủ</Link>
          <span>•</span>
          <Link href="/customer" className="hover:text-indigo-400 transition-colors">Dành cho khách hàng</Link>
          <span>•</span>
          <Link href="/admin" className="hover:text-indigo-400 transition-colors">Khu vực quản trị</Link>
        </div>
      </footer>
    </div>
  );
};
