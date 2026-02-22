import React from 'react';
import './DateRangePicker.css';

function DateRangePicker({ label, value = {}, onChange, min, max, className = '', ...props }) {
  const start = value.start || '';
  const end = value.end || '';
  const handleStart = (e) => onChange && onChange({ start: e.target.value, end });
  const handleEnd = (e) => onChange && onChange({ start, end: e.target.value });

  return (
    <div className={'bpm-daterangepicker ' + (className || '')} {...props}>
      {label && <label className="bpm-daterangepicker-label">{label}</label>}
      <div className="bpm-daterangepicker-fields">
        <input type="date" className="bpm-daterangepicker-input" value={start} onChange={handleStart} min={min} max={end || max} aria-label="Start" />
        <span className="bpm-daterangepicker-sep">to</span>
        <input type="date" className="bpm-daterangepicker-input" value={end} onChange={handleEnd} min={start || min} max={max} aria-label="End" />
      </div>
    </div>
  );
}

export default DateRangePicker;
