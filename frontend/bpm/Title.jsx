import React, { useState, useEffect } from 'react';
import './Title.css';
import logoOliver from '../img/Logo Oliver.png';

const Title = ({ 
  children, 
  level = 1,
  onLogoClick = null,
  ...props 
}) => {
  const Tag = `h${Math.min(Math.max(level, 1), 4)}`;
  const className = `bpm-title bpm-title-level-${level}`;
  
  // Récupérer le logo depuis localStorage si disponible
  const logoUrl = typeof window !== 'undefined' ? (localStorage.getItem('sidebarLogo') || logoOliver) : logoOliver;

  // Afficher le logo uniquement pour les titres de niveau 1 (principaux)
  const showLogo = level === 1;
  
  // Détecter si on est en mode mobile (réactif)
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Tag className={className} {...props}>
      <span className="bpm-title-content">
        {showLogo && (
          <img 
            src={logoUrl} 
            alt="Logo" 
            className="bpm-title-logo"
            onClick={isMobile && onLogoClick ? (e) => {
              e.preventDefault();
              onLogoClick();
            } : undefined}
            style={isMobile && onLogoClick ? { cursor: 'pointer' } : {}}
          />
        )}
        <span className="bpm-title-text">{children}</span>
      </span>
    </Tag>
  );
};

// Composants spécialisés pour chaque niveau
export const Title1 = ({ children, ...props }) => (
  <Title level={1} {...props}>{children}</Title>
);

export const Title2 = ({ children, ...props }) => (
  <Title level={2} {...props}>{children}</Title>
);

export const Title3 = ({ children, ...props }) => (
  <Title level={3} {...props}>{children}</Title>
);

export const Title4 = ({ children, ...props }) => (
  <Title level={4} {...props}>{children}</Title>
);

export default Title;













