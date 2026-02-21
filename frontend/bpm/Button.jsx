import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  type = 'button',
  fullWidth = false,
  ...props 
}) => {
  const buttonClasses = [
    'bpm-button',
    `bpm-button-${variant}`,
    `bpm-button-${size}`,
    fullWidth && 'bpm-button-full-width',
    disabled && 'bpm-button-disabled'
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={buttonClasses}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;














