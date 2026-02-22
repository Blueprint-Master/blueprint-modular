import React from 'react';
import './TopNav.css';

/**
 * Barre de navigation horizontale (navbar).
 * items = [{ label, href?, onClick? }], brand (node), className sur le conteneur
 */
const TopNav = ({
  brand,
  items = [],
  className = '',
  ...props
}) => (
  <nav className={`bpm-topnav ${className}`.trim()} role="navigation" {...props}>
    {brand && <div className="bpm-topnav-brand">{brand}</div>}
    <ul className="bpm-topnav-list">
      {items.map((item, i) => (
        <li key={i} className="bpm-topnav-item">
          {item.href != null ? (
            <a href={item.href} className="bpm-topnav-link">{item.label}</a>
          ) : (
            <button
              type="button"
              className="bpm-topnav-link bpm-topnav-button"
              onClick={item.onClick}
            >
              {item.label}
            </button>
          )}
        </li>
      ))}
    </ul>
  </nav>
);

export default TopNav;
