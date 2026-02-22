import React, { useState, useRef, useEffect } from 'react';
import './Autocomplete.css';

/**
 * Autocomplete / Combobox : input texte avec suggestions (options = liste de { value, label } ou strings)
 */
function Autocomplete({
  label,
  value = '',
  onChange,
  options = [],
  placeholder = '',
  disabled = false,
  className = '',
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const normalized = options.map((o) => (typeof o === 'object' ? { value: o.value, label: o.label != null ? o.label : o.value } : { value: o, label: o }));
  const filtered = value.trim()
    ? normalized.filter((o) => o.label.toString().toLowerCase().includes(value.toLowerCase()))
    : normalized;

  const handleSelect = (opt) => {
    onChange && onChange(opt.value);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true);
      return;
    }
    if (e.key === 'Escape') {
      setOpen(false);
      setHighlight(-1);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => (h < filtered.length - 1 ? h + 1 : h));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => (h > 0 ? h - 1 : -1));
      return;
    }
    if (e.key === 'Enter' && highlight >= 0 && filtered[highlight]) {
      e.preventDefault();
      handleSelect(filtered[highlight]);
    }
  };

  return (
    <div className={'bpm-autocomplete ' + (className || '')} ref={ref}>
      {label && <label className="bpm-autocomplete-label">{label}</label>}
      <input
        type="text"
        className="bpm-autocomplete-input"
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open}
        {...props}
      />
      {open && filtered.length > 0 && (
        <ul className="bpm-autocomplete-list" role="listbox">
          {filtered.map((opt, i) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={i === highlight}
              className={'bpm-autocomplete-option' + (i === highlight ? ' bpm-autocomplete-option-highlight' : '')}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(opt); }}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
