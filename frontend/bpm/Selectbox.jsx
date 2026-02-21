import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Selectbox.css';

const Selectbox = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  disabled = false,
  help = null,
  placeholder = 'Sélectionner...',
  required = false,
  ...props 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectboxRef = useRef(null);
  const wrapperRef = useRef(null);
  const lastSelectedValueRef = useRef(null);
  const isProcessingRef = useRef(false);
  const isTogglingRef = useRef(false); // Flag pour éviter les conflits de timing

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    if (!isOpen) {
      return; // Pas besoin d'écouter si le dropdown est fermé
    }

    const handleClickOutside = (event) => {
      // Ignorer si on est en train de toggler (évite les conflits de timing)
      if (isTogglingRef.current) {
        return;
      }
      
      // Ne pas fermer si le clic est dans le dropdown
      if (dropdownRef.current && dropdownRef.current.contains(event.target)) {
        return;
      }
      
      // Si le clic est sur le selectbox lui-même, laisser handleToggle gérer (ne pas fermer ici)
      if (selectboxRef.current && selectboxRef.current.contains(event.target)) {
        return;
      }
      
      setIsOpen(false);
    };
    // Utiliser un délai pour éviter que le clic qui ouvre le dropdown ne le ferme immédiatement
    // Utiliser 'click' au lieu de 'mousedown' pour éviter les conflits avec handleToggle
    // Le délai doit être plus long que le timeout de isTogglingRef (300ms) pour éviter les conflits
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
    }, 350); // Délai plus long que isTogglingRef (300ms) pour laisser handleToggle se terminer
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickOutside, true);
    };
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen]);

  // Calculer la position du dropdown si on est dans une modal
  useEffect(() => {
    if (!isOpen) {
      setDropdownStyle({});
      return;
    }

    const updateDropdownPosition = () => {
      if (!selectboxRef.current) {
        return;
      }

      // Utiliser position: fixed pour TOUS les dropdowns afin qu'ils sortent du contexte d'empilement
      // et s'affichent au-dessus des éléments sticky (comme les en-têtes de tableau)
      const selectboxRect = selectboxRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let left = selectboxRect.left;
      let width = selectboxRect.width;
      let top = selectboxRect.bottom + 4;
      
      // Calculer l'espace disponible en dessous du selectbox
      const spaceBelow = viewportHeight - selectboxRect.bottom - 20; // 20px de marge
      const spaceAbove = selectboxRect.top - 20; // 20px de marge
      
      // Calculer la hauteur maximale (max 300px, mais pas plus que l'espace disponible)
      // Forcer une hauteur maximale plus petite pour garantir le scroll si nécessaire
      // Si on a plus de 4 options, limiter à ~4 options visibles pour forcer le scroll
      const estimatedOptionHeight = 40; // Hauteur estimée d'une option
      const visibleOptions = 4; // Nombre d'options visibles avant scroll
      const maxHeightForScroll = options.length > visibleOptions 
        ? visibleOptions * estimatedOptionHeight 
        : options.length * estimatedOptionHeight;
      
      // Utiliser la plus petite valeur entre maxHeightForScroll et l'espace disponible
      // Mais s'assurer qu'on a au moins 150px de hauteur
      const availableSpace = Math.max(spaceBelow, spaceAbove, 150);
      const maxHeight = Math.min(300, Math.min(maxHeightForScroll, availableSpace));
      
      // Ajuster si le dropdown dépasse à droite
      if (left + width > viewportWidth - 10) {
        left = Math.max(4, viewportWidth - width - 10);
      }
      
      // Ajuster si le dropdown dépasse à gauche
      if (left < 4) {
        left = 4;
      }
      
      // Vérifier si on est dans une modal pour ajuster le z-index
      const modal = containerRef.current?.closest('.bpm-modal, .bpm-modal-backdrop');
      const zIndex = modal ? 1000002 : 10000; // Z-index élevé pour s'afficher au-dessus des éléments sticky (z-index: 10)
      
      const style = {
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${width}px`,
        maxHeight: `${maxHeight}px`,
        zIndex: zIndex,
        display: 'block',
        visibility: 'visible',
        opacity: 1,
        overflow: 'auto', // Utiliser overflow au lieu de overflowY/overflowX séparés
        WebkitOverflowScrolling: 'touch' // Pour le scroll fluide sur iOS
      };
      
      setDropdownStyle(style);
    };

    // Calculer la position avec un petit délai pour s'assurer que le DOM est prêt
    const timeoutId = setTimeout(updateDropdownPosition, 10);
    
    // Recalculer lors du scroll ou du redimensionnement (pour tous les dropdowns avec position: fixed)
    const handleScroll = () => {
      // Recalculer la position pour tous les dropdowns avec position: fixed
      updateDropdownPosition();
    };
    const handleResize = () => {
      // Recalculer la position pour tous les dropdowns avec position: fixed
      updateDropdownPosition();
    };
    
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
      setDropdownStyle({});
    };
  }, [isOpen, options.length]);

  const handleToggle = (e) => {
    // Stopper la propagation pour éviter les doubles clics
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // Marquer qu'on est en train de toggler pour éviter que handleClickOutside interfère
    isTogglingRef.current = true;
    setTimeout(() => {
      isTogglingRef.current = false;
    }, 300);
    
    if (disabled) {
      return;
    }
    
    // Utiliser une fonction de mise à jour fonctionnelle pour éviter les problèmes de closure
    // FORCER l'état initial à false si jamais il y a un problème
    setIsOpen(prevIsOpen => {
      // Sécurité : si prevIsOpen est undefined ou null, forcer à false
      const currentState = prevIsOpen === undefined || prevIsOpen === null ? false : prevIsOpen;
      return !currentState;
    });
  };

  const handleSelect = (optionValue) => {
    if (onChange && !disabled) {
      // Ne pas appeler onChange si la valeur est déjà sélectionnée
      // Comparer avec la valeur actuelle (en gérant les cas où value peut être null/undefined)
      const currentValue = value || '';
      const newValue = optionValue || '';
      if (currentValue === newValue) {
        setIsOpen(false);
        return;
      }
      
      // Ne pas traiter si on est déjà en train de traiter cette valeur
      if (isProcessingRef.current && lastSelectedValueRef.current === optionValue) {
        setIsOpen(false);
        return;
      }
      
      // Marquer comme en cours de traitement
      isProcessingRef.current = true;
      lastSelectedValueRef.current = optionValue;
      
      // Fermer le dropdown immédiatement pour un feedback visuel instantané
      setIsOpen(false);
      
      // Appeler onChange immédiatement après pour mettre à jour la valeur
      // Passer la valeur telle quelle, même si c'est une chaîne vide
      onChange(optionValue);
      
      // Réinitialiser le flag après un court délai
      setTimeout(() => {
        isProcessingRef.current = false;
        lastSelectedValueRef.current = null;
      }, 150);
    }
  };

  const selectedOption = options.find(opt => {
    const optValue = typeof opt === 'string' ? opt : opt.value;
    return optValue === value;
  });

  const displayValue = selectedOption 
    ? (typeof selectedOption === 'string' ? selectedOption : selectedOption.label)
    : (placeholder && !required ? placeholder : '');

  return (
    <div className="bpm-selectbox-container" ref={containerRef}>
      {label && (
        <label className="bpm-selectbox-label">
          {label}
          {help && (
            <span className="bpm-selectbox-help" title={help}>
              ⓘ
            </span>
          )}
        </label>
      )}
      <div className="bpm-selectbox-wrapper" ref={wrapperRef}>
        <div
          ref={selectboxRef}
          className={`bpm-selectbox ${disabled ? 'bpm-selectbox-disabled' : ''} ${isOpen ? 'bpm-selectbox-open' : ''}`}
          onClick={(e) => {
            // S'assurer que le clic est bien capturé même si c'est sur un enfant
            // Le clic sur les enfants (value, arrow) doit remonter au parent grâce à pointer-events: none
            if (!disabled) {
              handleToggle(e);
            }
          }}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleToggle(e);
            }
          }}
        >
          <span className={`bpm-selectbox-value ${!value && placeholder && !required ? 'bpm-selectbox-placeholder' : ''}`}>
            {displayValue}
          </span>
          <span className="bpm-selectbox-arrow">
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                <path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#1f1f1f">
                <path d="M480-344 240-584l56-56 184 184 184-184 56 56-240 240Z"/>
              </svg>
            )}
          </span>
        </div>
        
        {isOpen && !disabled && (() => {
          const isInModal = containerRef.current?.closest('.bpm-modal, .bpm-modal-backdrop');
          const dropdownContent = (
            <div 
              className="bpm-selectbox-dropdown" 
              ref={(el) => {
                dropdownRef.current = el;
              }}
              style={{
                ...dropdownStyle,
                // Forcer la visibilité avec des styles inline
                display: 'block',
                visibility: 'visible',
                opacity: 1,
                // Forcer le scroll si maxHeight est défini dans dropdownStyle
                ...(dropdownStyle.maxHeight && {
                  overflow: 'auto',
                  WebkitOverflowScrolling: 'touch'
                })
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
              }}
            >
              {options.length > 0 ? (
                  options.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const isSelected = optionValue === value;
                    
                    return (
                      <div
                        key={index}
                        className={`bpm-selectbox-option ${isSelected ? 'bpm-selectbox-option-selected' : ''}`}
                        onClick={() => handleSelect(optionValue)}
                        onMouseDown={(e) => e.stopPropagation()}
                        role="option"
                        aria-selected={isSelected}
                      >
                        {optionLabel}
                      </div>
                    );
                  })
                ) : (
                  <div className="bpm-selectbox-option" style={{ padding: '0.5rem 0.75rem', color: 'rgb(81, 81, 84)' }}>
                    Aucune option disponible
                  </div>
                )}
            </div>
          );
          
          // Utiliser un portal pour TOUS les dropdowns avec position: fixed
          // Cela garantit qu'ils sortent du contexte d'empilement et s'affichent au-dessus de tout
          // (y compris les éléments sticky comme les en-têtes de tableau)
          if (isInModal || dropdownStyle.position === 'fixed') {
            return createPortal(dropdownContent, document.body);
          }
          
          // Sinon, rendu normal (position: absolute)
          return dropdownContent;
        })()}
      </div>
    </div>
  );
};

export default Selectbox;
