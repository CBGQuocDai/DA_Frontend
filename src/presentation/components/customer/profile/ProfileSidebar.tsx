"use client";

import React from "react";
import {
  BookOpen,
  Heart,
  KeyRound,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@/src/shared/types";
import type { ProfileTab } from "./profile.types";
import { ProfileAvatar } from "./ProfileAvatar";

interface ProfileSidebarProps {
  user: User;
  activeTab: ProfileTab;
  favoriteCount: number;
  purchasedCount: number;
  onSelectTab: (tab: ProfileTab) => void;
  onLogout: () => void;
}

const navItemClass = (isActive: boolean) =>
  `w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
    isActive
      ? "bg-accent-light text-accent border border-rose-200/80 font-bold"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  }`;

const CountBadge: React.FC<{ count: number; isActive: boolean }> = ({
  count,
  isActive,
}) => (
  <span
    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
      isActive ? "bg-accent text-white" : "bg-slate-100 text-slate-600"
    }`}
  >
    {count}
  </span>
);

export const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  user,
  activeTab,
  favoriteCount,
  purchasedCount,
  onSelectTab,
  onLogout,
}) => {
  const items: {
    tab: ProfileTab;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    {
      tab: "profile",
      label: "Thông tin profile",
      icon: <UserIcon className="w-4 h-4" />,
    },
    {
      tab: "favorites",
      label: "Yêu thích",
      icon: <Heart className="w-4 h-4" />,
      count: favoriteCount,
    },
    {
      tab: "purchased",
      label: "Sách đã mua",
      icon: <BookOpen className="w-4 h-4" />,
      count: purchasedCount,
    },
    {
      tab: "password",
      label: "Đổi mật khẩu",
      icon: <KeyRound className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="lg:col-span-4 xl:col-span-3 space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 text-center">
        <ProfileAvatar key={user.id} user={user} />

        <h2 className="text-lg font-bold text-slate-900 tracking-tight">
          {user.fullName}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>

        <div className="grid grid-cols-2 gap-2 mt-5 pt-5 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={() => onSelectTab("favorites")}
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs text-slate-500 block">Yêu thích</span>
            <span className="text-base font-extrabold text-accent">
              {favoriteCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onSelectTab("purchased")}
            className="p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs text-slate-500 block">Đã mua</span>
            <span className="text-base font-extrabold text-slate-900">
              {purchasedCount}
            </span>
          </button>
        </div>
      </div>

      <nav className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 space-y-1">
        {items.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => onSelectTab(item.tab)}
              className={navItemClass(isActive)}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </span>
              {item.count !== undefined && (
                <CountBadge count={item.count} isActive={isActive} />
              )}
            </button>
          );
        })}

        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-accent hover:bg-accent-light transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
