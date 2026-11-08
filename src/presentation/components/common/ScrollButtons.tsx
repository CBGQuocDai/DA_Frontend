"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ScrollButtonsProps {
  onScroll: (direction: "left" | "right") => void;
  canScrollLeft?: boolean;
  canScrollRight?: boolean;
  className?: string;
}

const buttonClass =
  "pointer-events-auto flex h-9 w-9 items-center justify-center rounded-full bg-white/95 enabled:hover:bg-accent text-slate-700 enabled:hover:text-white border border-slate-200 shadow-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export const ScrollButtons: React.FC<ScrollButtonsProps> = ({
  onScroll,
  canScrollLeft = true,
  canScrollRight = true,
  className = "",
}) => (
  <div className={`pointer-events-none flex items-center justify-between ${className}`}>
    <button
      type="button"
      onClick={() => onScroll("left")}
      disabled={!canScrollLeft}
      className={buttonClass}
      aria-label="Cuộn trái"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button
      type="button"
      onClick={() => onScroll("right")}
      disabled={!canScrollRight}
      className={buttonClass}
      aria-label="Cuộn phải"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);
