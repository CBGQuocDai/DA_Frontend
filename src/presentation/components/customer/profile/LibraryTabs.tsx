'use client';

import React from 'react';
import Link from 'next/link';
import { BookOpen, Headphones, Heart, X } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';
import { BookCover } from '../book';
import { EmptyState } from '@/src/presentation/components/common';
import { TabHeader } from './ProfileParts';
import type { FavoriteBookItem, PurchasedBookItem } from './profile.types';

const BrowseStoreLink: React.FC<{ label: string }> = ({ label }) => (
  <Link
    href={ROUTES.CUSTOMER.STORE}
    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-md shadow-accent/30 transition-all"
  >
    {label}
  </Link>
);

interface FavoritesTabProps {
  items: FavoriteBookItem[];
  onRemove: (id: number) => void;
}

export const FavoritesTab: React.FC<FavoritesTabProps> = ({ items, onRemove }) => (
  <div className="space-y-6">
    <TabHeader
      eyebrow="Thư viện cá nhân"
      title="Sách yêu thích"
      aside={
        <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {items.length} cuốn sách
        </span>
      }
    />

    {items.length === 0 ? (
      <EmptyState
        icon={<Heart className="w-8 h-8" />}
        title="Chưa có cuốn sách nào trong danh sách yêu thích"
        description="Hãy dạo qua kho sách nói phong phú và bấm nút tim để lưu lại những cuốn sách bạn yêu thích nhé!"
        action={<BrowseStoreLink label="Khám phá sách nói ngay" />}
      />
    ) : (
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
        {items.map((item) => (
          <div
            key={item.id}
            className="group bg-white rounded-2xl border border-slate-200/90 hover:border-rose-300 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
          >
            <div className="relative aspect-[3/4.2] overflow-hidden bg-slate-100">
              <BookCover title={item.title} author={item.author} coverImage={item.coverImage} />
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                title="Xóa khỏi yêu thích"
                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 backdrop-blur-sm text-accent hover:bg-accent hover:text-white shadow-sm flex items-center justify-center transition-colors z-10"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white">
                {item.category}
              </span>
            </div>

            <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
              <div>
                <Link href={ROUTES.CUSTOMER.BOOK_DETAIL(item.id)}>
                  <h4
                    className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-accent transition-colors line-clamp-2 leading-snug"
                    title={item.title}
                  >
                    {item.title}
                  </h4>
                </Link>
                <p className="text-[11px] text-slate-500 mt-1 truncate">{item.author}</p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">⏱️ {item.duration}</span>
                <Link
                  href={ROUTES.CUSTOMER.BOOK_DETAIL(item.id)}
                  className="px-2.5 py-1 rounded-lg bg-accent-light hover:bg-accent text-accent hover:text-white text-[11px] font-bold transition-all flex items-center gap-1"
                >
                  Nghe <Headphones className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const PurchasedTab: React.FC<{ items: PurchasedBookItem[] }> = ({ items }) => (
  <div className="space-y-6">
    <TabHeader
      eyebrow="Thư viện bản quyền"
      title="Sách đã mua"
      aside={
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {items.length} cuốn đã sở hữu vĩnh viễn
        </span>
      }
    />

    {items.length === 0 ? (
      <EmptyState
        icon={<BookOpen className="w-8 h-8" />}
        title="Bạn chưa mua cuốn sách bản quyền nào"
        description="Mua sách để sở hữu trọn bộ audio chất lượng cao."
        action={<BrowseStoreLink label="Xem kho sách nói" />}
      />
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-2xl border border-slate-200/90 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 bg-white flex gap-4 items-center group"
          >
            <div className="w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-md bg-slate-100">
              <BookCover title={item.title} author={item.author} coverImage={item.coverImage} />
            </div>

            <div className="flex-1 min-w-0 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Đã mua ✓
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{item.orderCode}</span>
              </div>
              <Link href={ROUTES.CUSTOMER.BOOK_DETAIL(item.id)}>
                <h4
                  className="font-bold text-sm text-slate-900 group-hover:text-accent transition-colors truncate"
                  title={item.title}
                >
                  {item.title}
                </h4>
              </Link>
              <p className="text-xs text-slate-500 truncate">{item.author}</p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-1">
                <span>Ngày mua: {item.purchaseDate}</span>
                <span>•</span>
                <span className="font-semibold text-slate-700">{item.totalChapters} chương</span>
              </div>
              <div className="pt-2">
                <Link
                  href={ROUTES.CUSTOMER.BOOK_DETAIL(item.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent hover:bg-accent-hover text-white text-xs font-bold shadow-sm transition-all"
                >
                  Nghe trọn bộ <Headphones className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
