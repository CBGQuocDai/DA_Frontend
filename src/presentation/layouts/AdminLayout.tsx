import React from 'react';
import Link from 'next/link';
import { ROUTES } from '@/src/shared/constants';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-6">Trang quản trị</h2>
        <nav>
          <ul className="space-y-2">
            <li>
              <Link
                href={ROUTES.ADMIN.STATISTICS}
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Thống kê
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.ADMIN.MANAGE_BOOK}
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Quản lý sách
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES.ADMIN.MANAGE_VOICE}
                className="block px-4 py-2 rounded hover:bg-gray-700"
              >
                Quản lý giọng nói
              </Link>
            </li>
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
