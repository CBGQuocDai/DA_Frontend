import React from 'react';
import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5];

interface StarRatingProps {
  /** 0..5, rounded to the nearest whole star */
  value: number;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({ value, className = 'w-3.5 h-3.5' }) => (
  <div className="flex items-center gap-0.5 flex-shrink-0" aria-label={`${value} / 5 sao`}>
    {STARS.map((star) => (
      <Star
        key={star}
        className={`${className} ${
          star <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-border text-border'
        }`}
      />
    ))}
  </div>
);
