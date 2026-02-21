import React from 'react';
import './DocSidebar.css';

/**
 * Sidebar de navigation pour le site doc BPM.
 * @param {Object} props
 * @param {Array<{ title: string, links: Array<{ label: string, href: string, active?: boolean }> }>} props.sections - Sections (titre + liens)
 * @param {string} [props.className]
 */
const DocSidebar = ({ sections = [], className = '' }) => (
  <aside className={`bpm-doc-sidebar ${className}`.trim()} role="navigation">
    {sections.map((section, i) => (
      <div key={i} className="bpm-doc-sidebar-section">
        <h3 className="bpm-doc-sidebar-title">{section.title}</h3>
        {section.links.map((link, j) => (
          <a
            key={j}
            href={link.href}
            className={`bpm-doc-sidebar-link ${link.active ? 'bpm-doc-sidebar-link-active' : ''}`.trim()}
          >
            {link.label}
          </a>
        ))}
      </div>
    ))}
  </aside>
);

export default DocSidebar;
