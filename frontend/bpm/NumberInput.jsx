import React, { useState, useEffect } from 'react';
import './NumberInput.css';

const NumberInput = ({ 
  label, 
  value, 
  onChange, 
  onBlur: customOnBlur = null,
  min = null,
  max = null,
  step = 1,
  disabled = false,
  help = null,
  placeholder = '',
  ...props 
}) => {
  const [localValue, setLocalValue] = useState(value !== undefined ? value : '');

  // Pour les composants contrôlés, utiliser directement value (pas besoin de synchroniser localValue)
  // Utiliser la valeur contrôlée si fournie, sinon la valeur locale
  const currentValue = value !== undefined ? value : localValue;

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Pour les composants contrôlés, passer la valeur brute (string) pour permettre la saisie libre
    // Le parent peut décider de parser ou non
    if (value === undefined) {
      // Composant non contrôlé : parser immédiatement
      const newValue = inputValue === '' ? null : parseFloat(inputValue);
      setLocalValue(newValue);
      if (onChange && !disabled) {
        onChange(newValue);
      }
    } else {
      // Composant contrôlé : passer la valeur brute (string) pour permettre la saisie libre
      if (onChange && !disabled) {
        // Toujours passer la valeur brute (string), même si vide
        onChange(inputValue);
      }
    }
  };

  const handleBlur = (e) => {
    let val = e.target.value === '' ? null : parseFloat(e.target.value);
    
    if (val !== null) {
      if (min !== null && val < min) val = min;
      if (max !== null && val > max) val = max;
    }
    
    if (value === undefined) {
      setLocalValue(val);
    }
    // Si un customOnBlur est fourni, ne pas appeler onChange ici
    // Le parent gérera la conversion et la mise à jour via customOnBlur
    if (onChange && !disabled && !customOnBlur) {
      onChange(val);
    }
    // Appeler le onBlur personnalisé si fourni
    if (customOnBlur && !disabled) {
      customOnBlur(e);
    }
  };

  return (
    <div className="bpm-number-input-container">
      {label && (
        <label className="bpm-number-input-label">
          {label}
          {help && (
            <span className="bpm-number-input-help" title={help}>
              ⓘ
            </span>
          )}
        </label>
      )}
      <input
        type="text"
        inputMode="decimal"
        autoComplete="off"
        className={`bpm-number-input ${disabled ? 'bpm-number-input-disabled' : ''}`}
        value={currentValue === null || currentValue === undefined || currentValue === '' ? '' : String(currentValue)}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
};

export default NumberInput;




