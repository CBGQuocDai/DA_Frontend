'use client';

import React from 'react';
import Link from 'next/link';
import { Headphones, MessageCircle, Phone } from 'lucide-react';
import { ROUTES } from '@/src/shared/constants';

const LEGAL_LINES = [
  'Đơn vị chủ quản: Nền tảng Sách nói & Truyện Audio trực tuyến',
  'Đăng ký kinh doanh số: 0106165108-011 cấp ngày 10/07/2023.',
  'Địa chỉ: Tầng 4, Tòa nhà Grandeur, 138B Giảng Võ, Ba Đình, Hà Nội.',
  'Giấy xác nhận ĐKKD hoạt động phát hành xuất bản phẩm điện tử số 41/XN-CXBIPH do Cục Xuất bản, In và Phát hành cấp ngày 05/07/2023.',
];

const USEFUL_LINKS = [
  { label: 'Về chúng tôi', href: ROUTES.CUSTOMER.HOME },
  { label: 'Sách nói', href: ROUTES.CUSTOMER.STORE },
];

const HOTLINE = '1900 6868';

const FooterHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h4 className="text-slate-900 font-bold text-sm mb-3.5">{children}</h4>
);

export const CustomerFooter: React.FC = () => (
  <footer className="bg-white text-slate-500 text-sm mt-auto border-t border-slate-200/90 shadow-sm">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div className="space-y-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-black text-slate-900 lowercase">AudioBook</span>
            <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider bg-accent text-white rounded-[4px] shadow-sm shadow-accent/30">
              AUDIO
            </span>
          </div>
          {LEGAL_LINES.map((line) => (
            <p key={line} className="text-[11px] leading-relaxed text-slate-500">
              {line}
            </p>
          ))}
        </div>

        <div>
          <FooterHeading>Thông tin hữu ích</FooterHeading>
          <ul className="space-y-2 text-xs">
            {USEFUL_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} className="text-slate-500 hover:text-accent transition-colors">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <FooterHeading>Liên hệ</FooterHeading>
          <div className="space-y-2.5 text-xs">
            <a
              href={`tel:${HOTLINE.replace(/\s/g, '')}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent hover:bg-accent-hover text-white font-black text-xs shadow-md shadow-accent/20 transition-all hover:scale-105"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{HOTLINE}</span>
            </a>
            <p className="text-slate-500">Email: cskh@audiobook.vn</p>
            <p className="text-slate-500">Hotline: {HOTLINE}</p>
            <div className="flex items-center gap-2.5 pt-2">
              <span
                className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-sm"
                aria-label="Messenger"
              >
                <MessageCircle className="w-4 h-4" />
              </span>
              <span
                className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shadow-sm"
                aria-label="Zalo"
              >
                Z
              </span>
            </div>
          </div>
        </div>

        <div>
          <FooterHeading>Tải App</FooterHeading>
          <p className="text-xs text-slate-500 mb-2.5">Quét mã QR để tải APP</p>
          <div className="w-28 h-28 bg-white p-2 rounded-xl shadow-md border border-slate-200 flex items-center justify-center relative overflow-hidden">
            <svg className="w-full h-full text-slate-800" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm6 6h2v2h-2v-2zm-2-2h2v2h-2v-2zm-4 4h4v2h-4v-2zm2-4h2v2h-2v-2z" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-md">
                <Headphones className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
        <p>© 2026 AudioBook. Tất cả các quyền được bảo lưu.</p>
        <p>Đồ án tốt nghiệp - Nền tảng Audio trực tuyến</p>
      </div>
    </div>
  </footer>
);
