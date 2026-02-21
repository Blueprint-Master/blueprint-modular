import React, { useState, useEffect } from 'react';
import './ColorPicker.css';

const ColorPicker = ({ 
  label, 
  value = '#000000', 
  onChange, 
  help,
  disabled = false 
}) => {
  const [color, setColor] = useState(value);

  // Synchroniser l'état local avec la prop value quand elle change
  useEffect(() => {
    if (value !== undefined && value !== null) {
      // Nettoyer la valeur pour s'assurer qu'elle est valide
      const cleanValue = typeof value === 'string' ? value.trim() : '#000000';
      // Valider que c'est un code couleur hexadécimal valide
      if (/^#[0-9A-Fa-f]{6}$/.test(cleanValue)) {
        setColor(cleanValue);
      }
    }
  }, [value]);

  const handleChange = (e) => {
    const newColor = e.target.value;
    setColor(newColor);
    if (onChange) {
      onChange(newColor);
    }
  };

  return (
    <div className={`bpm-color-picker-container ${disabled ? 'bpm-color-picker-disabled' : ''}`}>
      {label && (
        <label className="bpm-color-picker-label">
          {label}
          {help && (
            <span className="bpm-color-picker-help" title={help}>
              ℹ️
            </span>
          )}
        </label>
      )}
      <div className="bpm-color-picker-wrapper">
        <input
          type="color"
          className="bpm-color-picker-input"
          value={color}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ColorPicker;





