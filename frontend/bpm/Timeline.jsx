import React from 'react';
import './Timeline.css';

/**
 * Timeline : liste d'événements. items = [{ id?, date, title, description?, icon? }]
 */
function Timeline({ items = [], className = '', ...props }) {
  return (
    <div className={'bpm-timeline ' + (className || '')} {...props}>
      {items.map((item, i) => (
        <div key={item.id != null ? item.id : i} className="bpm-timeline-item">
          <div className="bpm-timeline-marker">
            {item.icon || <span className="bpm-timeline-dot" />}
          </div>
          <div className="bpm-timeline-content">
            <div className="bpm-timeline-date">{item.date}</div>
            <div className="bpm-timeline-title">{item.title}</div>
            {item.description && <div className="bpm-timeline-desc">{item.description}</div>}
          </div>
        </div>
      ))}
    </div>
  );
}

export default Timeline;
