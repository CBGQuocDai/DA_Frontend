'use client';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StarRating = ({ rating, maxRating = 5, size = 'md', className = '' }: StarRatingProps) => {
  return (
    <div className={`star-rating star-rating-${size} ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => (
        <span key={i} className={i < rating ? 'star filled' : 'star'}>
          ★
        </span>
      ))}
    </div>
  );
};

export default StarRating;
