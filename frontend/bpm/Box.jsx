import React from 'react';
import './Box.css';

const Box = ({ 
  title,
  headerExtra,
  status,
  isConnected,
  error,
  details,
  lastCheck,
  checkFrequency,
  actions,
  className = '',
  ...props 
}) => {
  const statusColor = isConnected ? '#34C759' : '#FF3B30';
  
  return (
    <div 
      className={`bpm-box ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem',
        border: '1px solid rgb(237, 237, 237)',
        borderRadius: '8px',
        backgroundColor: isConnected ? '#f6f6f6' : '#fff5f5',
        height: '240px',
        ...props.style
      }}
      {...props}
    >
      <div style={{ flex: 1 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem',
          marginBottom: '0.25rem',
          position: 'relative'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: statusColor,
            boxShadow: isConnected 
              ? '0 0 8px rgba(52, 199, 89, 0.5)' 
              : '0 0 8px rgba(255, 59, 48, 0.5)'
          }} />
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>
            {title}
          </h3>
          {headerExtra && (
            <div style={{ marginLeft: 'auto', color: '#999', display: 'flex', alignItems: 'center' }}>
              {headerExtra}
            </div>
          )}
        </div>
        {lastCheck && (
          <div style={{ 
            fontSize: '0.75rem',
            color: '#999',
            marginLeft: '1.75rem',
            marginBottom: '0.5rem'
          }}>
            Dernière vérification: {lastCheck.toLocaleTimeString()}
            {checkFrequency && ` (${checkFrequency})`}
          </div>
        )}
        {error && (
          <div style={{ 
            color: '#FF3B30',
            fontSize: '0.875rem',
            marginLeft: '1.75rem',
            marginTop: '0.5rem'
          }}>
            {error}
          </div>
        )}
        {details && (
          <div style={{ 
            fontSize: '0.875rem',
            color: '#666',
            marginLeft: '1.75rem',
            marginTop: '0.5rem'
          }}>
            {details}
          </div>
        )}
      </div>
      {actions && (
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: 'auto' }}>
          {actions}
        </div>
      )}
    </div>
  );
};

export default Box;

