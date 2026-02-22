import React, { useEffect } from 'react';
import './Drawer.css';

function Drawer({ isOpen = false, onClose, placement = 'left', title, children, className = '', ...props }) {
  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e) {
      if (e.key === 'Escape' && onClose) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return function () {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={'bpm-drawer-backdrop' + (isOpen ? ' bpm-drawer-backdrop-visible' : '')}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        className={'bpm-drawer bpm-drawer-' + placement + (isOpen ? ' bpm-drawer-open' : '') + (className ? ' ' + className : '')}
        role="dialog"
        aria-modal="true"
        aria-label={title || 'Panneau lateral'}
        {...props}
      >
        {(title || onClose) && (
          <div className="bpm-drawer-header">
            {title && <h2 className="bpm-drawer-title">{title}</h2>}
            {onClose && (
              <button type="button" className="bpm-drawer-close" onClick={onClose} aria-label="Fermer">
                x
              </button>
            )}
          </div>
        )}
        <div className="bpm-drawer-body">{children}</div>
      </div>
    </>
  );
}

export default Drawer;
