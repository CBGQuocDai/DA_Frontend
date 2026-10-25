'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollButtonsProps {
  onScroll: (direction: 'left' | 'right') => void;
  className?: string;
}

const buttonClass =
  'p-1.5 rounded-full bg-surface hover:bg-accent text-text-secondary hover:text-white border border-border shadow-sm transition-colors';

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({ onScroll, className = '' }) => (
  <div className={`flex items-center gap-1.5 ${className}`}>
    <button type="button" onClick={() => onScroll('left')} className={buttonClass} aria-label="Cuộn trái">
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button type="button" onClick={() => onScroll('right')} className={buttonClass} aria-label="Cuộn phải">
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);
