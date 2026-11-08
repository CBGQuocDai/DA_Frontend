'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants';
import { authService } from '@/src/infrastructure/api/services';
import { ChangePasswordModal } from '@/src/presentation/components/admin/auth';
import { BarChart3, BookOpen, KeyRound, LogOut, Menu, Mic, PenLine, Radio, Tags, X } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  /** Tighter page gutter for full-height workspaces */
  compact?: boolean;
}

const navItems = [
  { label: 'Thống kê', href: ROUTES.ADMIN.STATISTICS, icon: BarChart3 },
  { label: 'Quản lý sách', href: ROUTES.ADMIN.MANAGE_BOOK, icon: BookOpen },
  { label: 'Quản lý tác giả', href: ROUTES.ADMIN.MANAGE_AUTHOR, icon: PenLine },
  { label: 'Quản lý thể loại', href: ROUTES.ADMIN.MANAGE_CATEGORY, icon: Tags },
  { label: 'Quản lý giọng nói', href: ROUTES.ADMIN.MANAGE_VOICE, icon: Mic },
];

const itemClass = 'flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer';
const idleItemClass = `${itemClass} text-text-secondary hover:bg-bg hover:text-text-primary`;

const Logo = () => (
  <Link href={ROUTES.ADMIN.STATISTICS} className="flex items-center gap-3">
    <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">
      <Radio className="w-5 h-5" />
    </div>
    <span className="text-lg font-bold text-text-primary tracking-tight">Sách Nói</span>
  </Link>
);

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, compact }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsDrawerOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  const handleLogout = () => {
    authService.logout();
    router.replace(ROUTES.ADMIN.LOGIN);
  };

  const sidebar = (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-border flex-shrink-0">
        <Logo />
        <button
          type="button"
          onClick={() => setIsDrawerOpen(false)}
          aria-label="Đóng menu"
          className="lg:hidden -mr-2 p-2 rounded-lg text-text-secondary hover:bg-bg hover:text-text-primary cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto" aria-label="Điều hướng quản trị">
        <ul className="space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href ||
              pathname.startsWith(href + '/') ||
              (href === ROUTES.ADMIN.MANAGE_BOOK && pathname.startsWith('/admin/books'));
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setIsDrawerOpen(false)}
                  aria-current={isActive ? 'page' : undefined}
                  className={isActive ? `${itemClass} bg-accent text-white shadow-sm` : idleItemClass}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => {
                setIsDrawerOpen(false);
                setIsChangingPassword(true);
              }}
              aria-haspopup="dialog"
              className={idleItemClass}
            >
              <KeyRound className="w-5 h-5 flex-shrink-0" />
              Đổi mật khẩu
            </button>
          </li>
        </ul>
      </nav>

      <div className="p-4 border-t border-border flex-shrink-0">
        <button type="button" onClick={handleLogout} className={`${itemClass} text-text-secondary hover:bg-error-light/50 hover:text-error`}>
          <LogOut className="w-5 h-5 flex-shrink-0" />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] bg-bg flex overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-surface border-r border-border flex-col flex-shrink-0 h-full">
        {sidebar}
      </aside>

      {/* Mobile / tablet drawer */}
      {isDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsDrawerOpen(false)} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu quản trị"
            className="relative flex h-full w-72 max-w-[85vw] flex-col bg-surface shadow-xl"
          >
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile / tablet top bar */}
        <header className="lg:hidden h-14 flex items-center gap-2 px-3 bg-surface border-b border-border flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Mở menu"
            aria-expanded={isDrawerOpen}
            className="p-2 rounded-lg text-text-secondary hover:bg-bg hover:text-text-primary cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo />
        </header>

        <main className="flex-1 flex flex-col min-h-0 min-w-0 overflow-y-auto">
          <div className={`flex-1 min-h-0 flex flex-col ${compact ? 'p-2 lg:p-3' : 'p-3.5 sm:p-5 lg:p-6'}`}>
            {children}
          </div>
        </main>
      </div>

      {isChangingPassword && <ChangePasswordModal onClose={() => setIsChangingPassword(false)} />}
    </div>
  );
};
