import React from 'react';
import './Spinner.css';

const Spinner = ({ 
  text = 'Chargement...',
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  ...props
}) => {
  return (
    <div className={`bpm-spinner-container ${className}`} {...props}>
      <div className={`bpm-spinner bpm-spinner-${size}`}>
        <div className="bpm-spinner-circle"></div>
      </div>
      {text && (
        <span className="bpm-spinner-text">{text}</span>
      )}
    </div>
  );
};

export default Spinner;












