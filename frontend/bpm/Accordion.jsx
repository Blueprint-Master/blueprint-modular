import React, { useState } from 'react';
import './Accordion.css';

/**
 * Accordion : plusieurs panneaux, un seul ou plusieurs ouverts.
 * sections = [{ id?, title, content }]
 * allowMultiple: true = plusieurs ouverts ; false = un seul à la fois
 */
const Accordion = ({
  sections = [],
  allowMultiple = false,
  defaultOpenIds = [],
  className = '',
  ...props
}) => {
  const [openIds, setOpenIds] = useState(() => new Set(defaultOpenIds));

  const toggle = (id) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else {
        if (!allowMultiple) next.clear();
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className={`bpm-accordion ${className}`.trim()} {...props}>
      {sections.map((section, i) => {
        const id = section.id != null ? section.id : `acc-${i}`;
        const isOpen = openIds.has(id);
        return (
          <div key={id} className="bpm-accordion-item">
            <button
              type="button"
              className={`bpm-accordion-header ${isOpen ? 'bpm-accordion-open' : ''}`}
              onClick={() => toggle(id)}
              aria-expanded={isOpen}
              aria-controls={`${id}-panel`}
              id={`${id}-head`}
            >
              <span className="bpm-accordion-icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
              <span className="bpm-accordion-title">{section.title}</span>
            </button>
            <div
              id={`${id}-panel`}
              role="region"
              aria-labelledby={`${id}-head`}
              className={`bpm-accordion-panel ${isOpen ? 'bpm-accordion-panel-visible' : ''}`}
            >
              <div className="bpm-accordion-content">{section.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;
