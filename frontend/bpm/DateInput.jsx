import React from 'react';
import './DateInput.css';

const DateInput = ({ 
  label, 
  value, 
  onChange, 
  disabled = false,
  help = null,
  min = null,
  max = null,
  ...props 
}) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    if (date instanceof Date) {
      return date.toISOString().split('T')[0];
    }
    if (typeof date === 'string') {
      return date.split('T')[0];
    }
    return '';
  };

  const handleChange = (e) => {
    if (onChange && !disabled) {
      const dateValue = e.target.value ? new Date(e.target.value) : null;
      onChange(dateValue);
    }
  };

  return (
    <div className="bpm-date-input-container">
      {label && (
        <label className="bpm-date-input-label">
          {label}
          {help && (
            <span className="bpm-date-input-help" title={help}>
              ⓘ
            </span>
          )}
        </label>
      )}
      <input
        type="date"
        className={`bpm-date-input ${disabled ? 'bpm-date-input-disabled' : ''}`}
        value={formatDateForInput(value)}
        onChange={handleChange}
        disabled={disabled}
        min={min ? formatDateForInput(min) : undefined}
        max={max ? formatDateForInput(max) : undefined}
        {...props}
      />
    </div>
  );
};

export default DateInput;














