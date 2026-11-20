'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface MenuAnchor {
  top: number;
  right: number;
}

/** Tính vị trí menu ngay dưới nút vừa bấm (hoặc phía trên khi bên dưới không đủ chỗ). */
export const getMenuAnchor = (trigger: HTMLElement, menuHeight: number): MenuAnchor => {
  const rect = trigger.getBoundingClientRect();
  const openUp = window.innerHeight - rect.bottom < menuHeight && rect.top > menuHeight;
  return {
    top: openUp ? rect.top - menuHeight - 4 : rect.bottom + 4,
    right: Math.max(8, window.innerWidth - rect.right),
  };
};

interface FloatingMenuProps {
  anchor: MenuAnchor;
  onClose: () => void;
  children: React.ReactNode;
}

/** Menu vị trí cố định, render qua portal nên overflow của bảng không cắt mất. Tự đóng khi bấm ra ngoài, cuộn hoặc đổi kích thước cửa sổ. */
export const FloatingMenu: React.FC<FloatingMenuProps> = ({ anchor, onClose, children }) => {
  useEffect(() => {
    window.addEventListener('click', onClose);
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('click', onClose);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  return createPortal(
    <div
      style={{ position: 'fixed', top: anchor.top, right: anchor.right, zIndex: 9999 }}
      className="bg-surface border border-border rounded-xl shadow-xl py-1 min-w-[140px] animate-in fade-in zoom-in-95 duration-100"
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};
