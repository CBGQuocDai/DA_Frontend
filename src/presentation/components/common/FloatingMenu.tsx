'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface MenuAnchor {
  top: number;
  right: number;
}

/** Positions a menu under (or above, when there is no room) the clicked trigger. */
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

/** Fixed-position menu rendered in a portal, so table overflow cannot clip it. Closes on outside click, scroll or resize. */
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
