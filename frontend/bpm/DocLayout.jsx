import React from 'react';
import './DocLayout.css';

/**
 * Layout principal du site doc BPM : barre nav + sidebar + zone main.
 * @param {Object} props
 * @param {React.ReactNode} props.nav - Contenu de la barre nav (ex. <DocNav />)
 * @param {React.ReactNode} props.sidebar - Contenu de la sidebar (ex. <DocSidebar />)
 * @param {React.ReactNode} props.children - Contenu principal
 * @param {string} [props.className]
 */
const DocLayout = ({ nav, sidebar, children, className = '' }) => (
  <div className={`bpm-doc-layout-root ${className}`.trim()}>
    {nav}
    <div className="bpm-doc-layout-body">
      {sidebar}
      <main className="bpm-doc-main">{children}</main>
    </div>
  </div>
);

export default DocLayout;
