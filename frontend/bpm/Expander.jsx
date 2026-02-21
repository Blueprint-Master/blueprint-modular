import React, { useState } from 'react';
import './Expander.css';

const Expander = ({ title, children, defaultExpanded = false, ...props }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="bpm-expander" {...props}>
      <div 
        className={`bpm-expander-header ${isExpanded ? 'bpm-expander-open' : 'bpm-expander-closed'}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="bpm-expander-icon">
          {isExpanded ? (
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
              <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
              <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
            </svg>
          )}
        </span>
        <span className="bpm-expander-title">{title}</span>
      </div>
      {isExpanded && (
        <div className="bpm-expander-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Expander;