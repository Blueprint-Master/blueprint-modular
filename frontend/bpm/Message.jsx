import React from 'react';
import './Message.css';

const Message = ({ 
  type = 'info', // 'info', 'success', 'warning', 'error'
  children,
  className = '',
  ...props 
}) => {
  return (
    <div 
      className={`bpm-message bpm-message-${type} ${className}`}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

export default Message;












