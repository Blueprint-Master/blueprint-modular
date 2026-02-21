import React from 'react';
import './DocNav.css';

/**
 * Barre de navigation supérieure pour le site doc BPM.
 * @param {Object} props
 * @param {string} [props.logoUrl] - URL du logo
 * @param {string} [props.homeUrl='/'] - Lien accueil
 * @param {Array<{ label: string, href: string }>} props.links - Liens (Get started, Components, API Reference, etc.)
 */
const DocNav = ({ logoUrl, homeUrl = '/', links = [], className = '' }) => (
  <nav className={`bpm-doc-nav ${className}`.trim()} role="navigation">
    <a href={homeUrl} className="bpm-doc-nav-brand">
      {logoUrl && <img src={logoUrl} alt="" className="bpm-doc-nav-logo" />}
      <span className="bpm-doc-nav-word-blueprint">Blueprint</span>
      <span className="bpm-doc-nav-word-modular">Modular</span>
    </a>
    {links.map((link, i) => (
      <a key={i} href={link.href} className="bpm-doc-nav-link">
        {link.label}
      </a>
    ))}
  </nav>
);

export default DocNav;
