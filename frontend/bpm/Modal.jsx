import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import './Modal.css';

const MODAL_PORTAL_ZINDEX = 100000; // Au-dessus de la sidebar (1000) et notification (1001)

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true 
}) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClose();
  };

  // Rendre dans un portail vers document.body pour que la modal soit au-dessus
  // de la sidebar et de tous les éléments fixes (problème de stacking context)
  const modalContent = (
    <div 
      className={`bpm-modal-backdrop ${!isOpen ? 'bpm-modal-hidden' : ''}`}
      onClick={handleBackdropClick}
      style={{ zIndex: MODAL_PORTAL_ZINDEX }}
    >
      <div 
        className={`bpm-modal bpm-modal-${size} ${!isOpen ? 'bpm-modal-hidden' : ''}`} 
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: MODAL_PORTAL_ZINDEX + 1 }}
      >
        <div className="bpm-modal-header">
          {title && <h3 className="bpm-modal-title">{title}</h3>}
          {showCloseButton && (
            <button 
              className="bpm-modal-close" 
              onClick={handleCloseClick}
              type="button"
              aria-label="Fermer"
            >
              ×
            </button>
          )}
        </div>
        <div className="bpm-modal-content">
          {children}
        </div>
      </div>
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default Modal;

