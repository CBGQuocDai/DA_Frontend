'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { AccountMenu } from './AccountMenu';
import { HeaderSearch } from './HeaderSearch';
import { CUSTOMER_NAV_LINKS } from './navLinks';

export const BrandLogo: React.FC = () => (
  <Link href={ROUTES.CUSTOMER.HOME} className="flex items-center select-none flex-shrink-0">
    <span className="text-2xl font-black tracking-tight text-slate-900 lowercase">AudioBook</span>
  </Link>
);

export const CustomerHeader: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-8 md:gap-10">
          <BrandLogo />
          <nav className="hidden md:flex items-center gap-7">
            {CUSTOMER_NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-semibold transition-colors duration-200 ${
                  pathname === item.href
                    ? 'text-accent font-bold'
                    : 'text-slate-600 hover:text-accent'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <HeaderSearch />
          <AccountMenu />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-accent hover:bg-slate-100 transition-colors"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1 shadow-lg">
          {CUSTOMER_NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 px-3 text-sm font-semibold text-slate-700 hover:text-accent hover:bg-accent-light rounded-lg transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};
