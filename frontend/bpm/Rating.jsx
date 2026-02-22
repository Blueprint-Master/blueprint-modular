import React from 'react';
import './Rating.css';

/**
 * Rating / stars : note de 1 à max (défaut 5). value (nombre), onChange(v), readOnly
 */
function Rating({ value = 0, max = 5, onChange, readOnly = false, className = '', ...props }) {
  return (
    <div className={'bpm-rating ' + (readOnly ? 'bpm-rating-readonly ' : '') + (className || '')} role="img" aria-label={value + ' sur ' + max} {...props}>
      {Array.from({ length: max }, (_, i) => {
        const starValue = i + 1;
        const filled = value >= starValue;
        return (
          <button
            key={i}
            type="button"
            className={'bpm-rating-star ' + (filled ? 'bpm-rating-star-filled' : '')}
            disabled={readOnly}
            onClick={() => !readOnly && onChange && onChange(starValue)}
            aria-label={starValue + ' etoiles'}
            aria-pressed={filled}
          >
            &#9733;
          </button>
        );
      })}
    </div>
  );
}

export default Rating;
