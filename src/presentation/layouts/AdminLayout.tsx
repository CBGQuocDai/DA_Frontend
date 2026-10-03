import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ROUTES } from '@/src/shared/constants';
import { BarChart3, BookOpen, Mic, LogOut, Radio } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const navItems = [
  {
    label: 'Thống kê',
    href: ROUTES.ADMIN.STATISTICS,
    icon: <BarChart3 className="w-5 h-5" />,
  },
  {
    label: 'Quản lý sách',
    href: ROUTES.ADMIN.MANAGE_BOOK,
    icon: <BookOpen className="w-5 h-5" />,
  },
  {
    label: 'Quản lý giọng nói',
    href: ROUTES.ADMIN.MANAGE_VOICE,
    icon: <Mic className="w-5 h-5" />,
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  return (
    <div className="h-screen h-[100dvh] max-h-[100dvh] bg-bg flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0 h-full">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-border flex-shrink-0">
          <Link href={ROUTES.ADMIN.STATISTICS} className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center text-white">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-lg font-bold text-text-primary tracking-tight">Sách Nói</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + '/') ||
                (item.href === ROUTES.ADMIN.MANAGE_BOOK && pathname.startsWith('/admin/books'));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-accent text-white shadow-sm'
                        : 'text-text-secondary hover:bg-bg hover:text-text-primary'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border flex-shrink-0">
          <Link
            href={ROUTES.ADMIN.LOGIN}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:bg-bg hover:text-text-primary transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </Link>
        </div>
      </aside>

      {/* Main Content: full height 100dvh, flex-1 min-w-0, no top header bar */}
      <main className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto">
        <div className="flex-1 min-h-0 p-3.5 sm:p-5 lg:p-6 flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
