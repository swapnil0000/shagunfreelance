import { useState } from 'react';
import { Star } from 'lucide-react';

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
};

export default function StarRating({
  rating = 0,
  onChange,
  size = 'md',
  readOnly = false,
  maxStars = 5,
}) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = hoverRating || rating;
  const starSize = sizeMap[size] || sizeMap.md;

  return (
    <div className="inline-flex items-center gap-0.5" role="img" aria-label={`${rating} out of ${maxStars} stars`}>
      {Array.from({ length: maxStars }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starValue)}
            onMouseEnter={() => !readOnly && setHoverRating(starValue)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            className={`${
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110'
            } transition-transform`}
            aria-label={`${starValue} star${starValue > 1 ? 's' : ''}`}
            tabIndex={readOnly ? -1 : 0}
          >
            <Star
              className={`${starSize} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-neutral-300'
              } transition-colors`}
            />
          </button>
        );
      })}
    </div>
  );
}
