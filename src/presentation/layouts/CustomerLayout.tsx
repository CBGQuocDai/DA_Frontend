import React from 'react';
import Link from 'next/link';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Top Banner Thông báo */}
      <div className="bg-indigo-600 text-white text-xs font-medium py-1.5 px-4 text-center">
        🎉 Chào mừng bạn đến với DA Customer Portal! Miễn phí giao hàng cho đơn từ 500k.
      </div>

      {/* Main Header / Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/customer" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-white shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
              DA
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-tight">
                DA<span className="text-indigo-600">Store</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Customer Experience</span>
            </div>
          </Link>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm, dịch vụ..."
                className="w-full bg-slate-100 border border-transparent focus:border-indigo-500 focus:bg-white text-sm rounded-full pl-10 pr-4 py-2 outline-none transition-all placeholder:text-slate-400"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/customer"
              className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors hidden sm:inline-block"
            >
              Cửa hàng
            </Link>
            <Link
              href="/admin"
              className="text-xs px-2.5 py-1 rounded-md bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 font-semibold transition-colors"
            >
              Vào Admin
            </Link>
            <Link
              href="/login"
              className="text-sm px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md shadow-indigo-600/20 transition-all hover:shadow-lg"
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Customer Footer */}
      <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold text-base mb-3">Về DA Store</h4>
              <p className="text-xs leading-relaxed text-slate-400">
                Nền tảng mua sắm hiện đại và kết nối trực tiếp với hệ sinh thái DA Enterprise.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-3">Chăm sóc khách hàng</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#" className="hover:text-white transition-colors">Trung tâm trợ giúp</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Hướng dẫn mua hàng</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Chính sách hoàn tiền</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-3">Liên kết nhanh</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/customer" className="hover:text-white transition-colors">Trang chủ Khách hàng</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Đăng nhập tài khoản</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Khu vực quản trị</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-base mb-3">Hotline hỗ trợ</h4>
              <p className="text-xs text-slate-400 mb-2">1900 6868 (8:00 - 21:00 hàng ngày)</p>
              <p className="text-xs text-slate-400">Email: support@dastore.vn</p>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs gap-2">
            <p>© 2026 DA Store. Tất cả các quyền được bảo lưu.</p>
            <p className="text-slate-500">Thiết kế bởi DA Engineering Team</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
