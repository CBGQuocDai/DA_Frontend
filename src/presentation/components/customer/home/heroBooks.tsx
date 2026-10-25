import React from 'react';

export interface HeroBook {
  id: string;
  title: string;
  cover: React.ReactNode;
}

// Decorative, hand-drawn covers for the homepage hero shelf
export const HERO_BOOKS: HeroBook[] = [
  {
    id: 'hero-psychology',
    title: 'Những Đòn Tâm Lý Trong Thuyết Phục',
    cover: (
      <div className="w-full h-full bg-[#f8f6f0] text-slate-800 p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-200/80">
        <div className="text-center pt-2">
          <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase block">
            Robert B. Cialdini
          </span>
          <span className="text-[7px] text-slate-400 italic block">Influence: The Psychology of Persuasion</span>
        </div>
        <div className="my-auto flex items-center justify-center gap-2">
          <div className="w-9 h-11 bg-blue-500 rounded-t-full rounded-bl-full flex items-center justify-center text-[10px] text-white shadow-sm">
            🧠
          </div>
          <div className="w-4 h-0.5 bg-slate-300" />
          <div className="w-9 h-11 bg-amber-400 rounded-t-full rounded-br-full flex items-center justify-center text-[10px] text-white shadow-sm">
            💡
          </div>
        </div>
        <div className="text-center pb-2">
          <span className="text-[12px] font-black uppercase text-slate-900 leading-tight block">Những Đòn Tâm Lý</span>
          <span className="text-[9px] font-extrabold uppercase text-amber-600 block mt-0.5">Trong Thuyết Phục</span>
        </div>
      </div>
    ),
  },
  {
    id: 'hero-nutrition',
    title: 'Y Học Dinh Dưỡng',
    cover: (
      <div className="w-full h-full bg-white text-slate-800 p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-200">
        <div className="text-center pt-1 border-b border-slate-100 pb-1">
          <span className="text-[10px] font-black tracking-wider text-slate-700 uppercase block">
            Bác Sĩ Ray D. Strand
          </span>
          <span className="text-[8px] text-slate-400 block">Nguyễn Trung dịch</span>
        </div>
        <div className="my-auto flex flex-col items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/10 to-rose-500/10 flex items-center justify-center p-2 shadow-inner">
            <span className="text-4xl filter drop-shadow">🥦🍎🥕🍇</span>
          </div>
        </div>
        <div className="text-center pb-1">
          <div className="bg-emerald-600 text-white font-black text-[12px] uppercase py-1 px-2 rounded tracking-wide shadow-sm mb-1">
            Y Học Dinh Dưỡng
          </div>
          <span className="text-[9px] font-bold text-slate-700 leading-tight block">
            Những điều bác sĩ không nói với bạn
          </span>
        </div>
      </div>
    ),
  },
  {
    id: 'hero-cyber',
    title: 'Mật Mã Đen',
    cover: (
      <div className="w-full h-full bg-[#0a0911] text-white p-4 flex flex-col justify-between select-none relative overflow-hidden border border-slate-800">
        <div className="text-center pt-2">
          <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest block">
            Bestseller Công Nghệ
          </span>
        </div>
        <div className="my-auto flex items-center justify-center">
          <div className="relative w-20 h-24 rounded-full border border-amber-500/30 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-transparent to-transparent animate-pulse" />
            <span className="text-4xl text-amber-400/80">🧬</span>
          </div>
        </div>
        <div className="text-center pb-2">
          <span className="text-[14px] font-black uppercase text-amber-400 tracking-wider block drop-shadow">
            Mật Mã Đen
          </span>
          <span className="text-[8px] text-slate-400 tracking-wide block mt-0.5">Hacker Vĩ Đại Nhất</span>
        </div>
      </div>
    ),
  },
];
