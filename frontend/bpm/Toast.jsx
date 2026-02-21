import React, { useState, createContext, useContext } from 'react';
import { useNotificationHistory } from '../../contexts/NotificationHistoryContext';
import { getNotificationLevel } from '../../utils/notificationLevels';
import './Toast.css';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const { addNotification } = useNotificationHistory();

  const showToast = (message, type = 'info', duration = 5000, title = null, pageName = null, pageIcon = null, level = null) => {
    // Éviter les doublons : ne pas afficher le même message si il est déjà affiché
    setToasts(prev => {
      const isDuplicate = prev.some(toast => toast.message === message && toast.type === type && toast.title === title && toast.pageName === pageName);
      if (isDuplicate) {
        return prev; // Ne pas ajouter de doublon
      }
      
      const id = Date.now();
      const newToast = { id, message, type, title, pageName, pageIcon };
      const notificationLevel = level ?? getNotificationLevel({ type, title, pageName, message });
      
      // Enregistrer dans l'historique des notifications (seulement si ce n'est pas un doublon)
      // La déduplication dans addNotification empêchera aussi les doublons dus aux re-renders
      addNotification({ message, type, title, pageName, pageIcon, level: notificationLevel });
      
      setTimeout(() => {
        setToasts(current => current.filter(toast => toast.id !== id));
      }, duration);
      
      return [...prev, newToast];
    });
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="bpm-toast-container">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

const Toast = ({ message, type, title, pageName, pageIcon, onClose }) => {
  return (
    <div className={`bpm-toast bpm-toast-${type}`}>
      <div className="bpm-toast-content">
        {pageName && (
          <div className="bpm-toast-page-header">
            {pageIcon && (
              <span className="bpm-toast-page-icon" dangerouslySetInnerHTML={{ __html: pageIcon }} />
            )}
            <span className="bpm-toast-page-name">{pageName}</span>
          </div>
        )}
        {title && (
          <div className="bpm-toast-header">
            <span className="bpm-toast-title">{title}</span>
          </div>
        )}
        <span className="bpm-toast-message">{message}</span>
      </div>
      <button 
        className="bpm-toast-close" 
        onClick={onClose}
        aria-label="Fermer"
        style={{ 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: '1'
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;