'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CircleUser, LogOut, User as UserIcon } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { useCustomerAuth } from '@/src/presentation/hooks/customer';
import { CustomerAvatar } from '@/src/presentation/components/customer/common/CustomerAvatar';

export const AccountMenu: React.FC = () => {
  const router = useRouter();
  const { user, logout, refreshProfile } = useCustomerAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tự động đồng bộ profile mới nhất (avatar, họ tên) khi đã đăng nhập
  const userId = user?.id;
  useEffect(() => {
    if (userId) {
      refreshProfile();
    }
  }, [userId, refreshProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const close = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    close();
    router.push(ROUTES.CUSTOMER.LOGIN);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="p-1.5 rounded-full text-slate-600 hover:text-accent hover:bg-accent-light transition-colors flex items-center justify-center focus:outline-none"
        aria-label="Tài khoản"
      >
        {user ? (
          <CustomerAvatar user={user} className="w-7 h-7 rounded-full border border-rose-500/50 shadow-sm text-xs" />
        ) : (
          <CircleUser className="w-6 h-6" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200/90 rounded-xl shadow-xl shadow-slate-200/60 py-2 z-50 text-xs">
          {user ? (
            <>
              <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                <CustomerAvatar user={user} className="w-9 h-9 rounded-full border border-rose-500/50 shrink-0 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 truncate">{user.fullName || 'Người dùng'}</p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{user.email}</p>
                </div>
              </div>
              <div className="py-1">
                <Link
                  href={ROUTES.CUSTOMER.PROFILE}
                  onClick={close}
                  className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-accent hover:bg-accent-light transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-slate-400" />
                  Hồ sơ cá nhân
                </Link>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-2 px-4 py-2 text-accent hover:text-accent-hover hover:bg-accent-light transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </div>
            </>
          ) : (
            <div className="p-2 space-y-1.5">
              <Link
                href={ROUTES.CUSTOMER.LOGIN}
                onClick={close}
                className="flex items-center justify-center w-full py-2 px-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-semibold transition-colors shadow-md shadow-accent/20"
              >
                Đăng nhập
              </Link>
              <Link
                href={ROUTES.CUSTOMER.REGISTER}
                onClick={close}
                className="flex items-center justify-center w-full py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium transition-colors"
              >
                Đăng ký tài khoản
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
