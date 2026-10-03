'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`${ROUTES.CUSTOMER.HOME}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return (
    <div className="min-h-screen bg-bg">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface border-b border-border">
        <div className="container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={ROUTES.CUSTOMER.HOME} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 001.414 1.414m2.828-9.9a9 9 0 012.828-2.828" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-text-primary">Sách Nói</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm sách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-bg border border-border rounded-lg text-sm focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </form>

            {/* Nav Actions */}
            <nav className="flex items-center gap-4">
              <span className="text-sm text-text-muted cursor-not-allowed" title="Sắp ra mắt">
                Thư viện
              </span>
              <span className="text-sm text-text-muted cursor-not-allowed" title="Sắp ra mắt">
                Lịch sử
              </span>
              <button className="w-9 h-9 bg-accent rounded-full flex items-center justify-center text-white text-sm font-medium">
                U
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border mt-16">
        <div className="container py-8">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <p>© 2026 Sách Nói. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-6">
              <Link href="#" className="hover:text-text-primary transition-colors">Điều khoản</Link>
              <Link href="#" className="hover:text-text-primary transition-colors">Bảo mật</Link>
              <Link href="#" className="hover:text-text-primary transition-colors">Liên hệ</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
