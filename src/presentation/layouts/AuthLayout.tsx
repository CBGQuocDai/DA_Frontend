'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { BrandLogo, CUSTOMER_NAV_LINKS } from '@/src/presentation/components/customer/layout';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const NAV_LINKS = [{ label: 'Trang chủ', href: ROUTES.CUSTOMER.HOME }, ...CUSTOMER_NAV_LINKS];

/** Customer sign-in / sign-up shell: top bar plus a centered card. */
export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const isRegister = pathname === ROUTES.CUSTOMER.REGISTER;

  return (
    <div className="theme-customer min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <BrandLogo />

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-accent transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href={ROUTES.CUSTOMER.STORE}
              className="p-2 text-slate-500 hover:text-accent hover:bg-accent-light rounded-full transition-colors"
              aria-label="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </Link>
            <Link
              href={isRegister ? ROUTES.CUSTOMER.LOGIN : ROUTES.CUSTOMER.REGISTER}
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-accent hover:bg-accent-hover text-white transition-all shadow-md shadow-accent/20 active:scale-95"
            >
              {isRegister ? 'Đăng nhập' : 'Đăng ký'}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-[440px] bg-white border border-slate-200/90 rounded-2xl shadow-xl shadow-slate-200/50 p-7 sm:p-9">
          {children}
        </div>
      </main>
    </div>
  );
};
