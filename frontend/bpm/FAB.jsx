import React from 'react';
import './FAB.css';

function FAB({ children, onClick, placement = 'bottom-right', title, className = '', ...props }) {
  return (
    <button
      type="button"
      className={'bpm-fab bpm-fab-' + placement + (className ? ' ' + className : '')}
      onClick={onClick}
      title={title}
      aria-label={title || 'Action'}
      {...props}
    >
      {children}
    </button>
  );
}

export default FAB;
