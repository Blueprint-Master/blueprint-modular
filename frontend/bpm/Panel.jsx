import React from 'react';
import './Panel.css';

/**
 * Panneau informatif BPM (notifications, alertes, diagnostics, états vides, messages d'erreur).
 * Variantes : info | warning | error | success
 */
const Panel = ({
  variant = 'info',
  title = null,
  icon = null,
  children,
  className = '',
  ...props
}) => {
  const iconChar = icon ?? (variant === 'error' ? '!' : variant === 'warning' ? '⚠' : variant === 'success' ? '✓' : 'ℹ');
  return (
    <div
      className={`bpm-panel bpm-panel-${variant} ${className}`.trim()}
      role="region"
      aria-label={title || `Panneau ${variant}`}
      {...props}
    >
      {(title || icon !== false) && (
        <div className="bpm-panel-header">
          {icon !== false && <span className="bpm-panel-icon" aria-hidden="true">{icon ?? iconChar}</span>}
          {title && <span className="bpm-panel-title">{title}</span>}
        </div>
      )}
      {children && <div className="bpm-panel-body">{children}</div>}
    </div>
  );
};

export default Panel;
