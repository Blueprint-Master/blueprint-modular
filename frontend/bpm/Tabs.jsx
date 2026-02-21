import React, { useState, useEffect } from 'react';
import './Tabs.css';

const Tabs = ({ 
  tabs = [], 
  defaultTab = 0,
  onChange,
  ...props 
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // Synchroniser avec defaultTab si il change (contrôlé)
  useEffect(() => {
    if (defaultTab !== undefined && defaultTab !== activeTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  const handleTabClick = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index);
    }
  };

  // Si tabs est un tableau de strings, on les convertit en objets
  const normalizedTabs = tabs.map((tab, index) => {
    if (typeof tab === 'string') {
      return { label: tab, content: null, key: index };
    }
    return { ...tab, key: tab.key || index };
  });

  return (
    <div className="bpm-tabs-container" {...props}>
      <div className="bpm-tabs-header">
        {normalizedTabs.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            className={`bpm-tab-button ${activeTab === index ? 'bpm-tab-active' : ''}`}
            onClick={() => handleTabClick(index)}
            data-label={tab.label}
          >
            <span className="bpm-tab-button-text">{tab.label}</span>
          </button>
        ))}
        <div className="bpm-tabs-spacer" aria-hidden="true" />
      </div>
      <div className="bpm-tabs-content">
        {normalizedTabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;

