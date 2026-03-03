'use client';

import React, { useState } from 'react';

// Tabs Component
const Tabs = ({
  tabs = [],
  defaultActiveTab = 0,
  onChange = null,
  variant = 'default',
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  const variantClasses = {
    default: {
      container: 'flex border-b border-gray-200',
      tab: 'px-4 py-3 font-medium text-sm border-b-2 transition duration-300',
      activeTab: 'border-blue-600 text-blue-600',
      inactiveTab: 'border-transparent text-gray-600 hover:text-gray-900',
    },
    pill: {
      container: 'flex gap-2 p-2 bg-gray-100 rounded-lg',
      tab: 'px-4 py-2 font-medium text-sm rounded-lg transition duration-300',
      activeTab: 'bg-blue-600 text-white',
      inactiveTab: 'text-gray-700 hover:bg-gray-200',
    },
    minimal: {
      container: 'flex gap-4 border-b border-gray-200',
      tab: 'pb-2 font-medium text-sm transition duration-300',
      activeTab: 'text-blue-600 border-b-2 border-blue-600',
      inactiveTab: 'text-gray-600 hover:text-gray-900',
    },
    card: {
      container: 'flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-gray-200',
      tab: 'px-4 py-2.5 font-medium text-sm rounded-md transition duration-300',
      activeTab: 'bg-blue-600 text-white shadow',
      inactiveTab: 'text-gray-700 hover:bg-gray-50',
    },
  };

  const styles = variantClasses[variant];

  return (
    <div className={className}>
      <div className={styles.container}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            onClick={() => handleTabChange(index)}
            disabled={tab.disabled}
            className={`
              ${styles.tab}
              ${activeTab === index ? styles.activeTab : styles.inactiveTab}
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
            {tab.badge && (
              <span className="ml-2 bg-red-600 text-white text-xs px-2 py-0.5 rounded">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Tab Content Component (helper)
export const TabContent = ({ children, className = '' }) => {
  return <div className={`animate-fadeIn ${className}`.trim()}>{children}</div>;
};

// Vertical Tabs Component
export const VerticalTabs = ({
  tabs = [],
  defaultActiveTab = 0,
  onChange = null,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  return (
    <div className={`flex gap-6 ${className}`.trim()}>
      <div className="flex flex-col gap-2 border-r border-gray-200 pr-4 min-w-max">
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            onClick={() => handleTabChange(index)}
            disabled={tab.disabled}
            className={`
              px-4 py-2.5 text-left font-medium text-sm rounded-lg
              border-l-4 transition duration-300
              ${
                activeTab === index
                  ? 'border-l-blue-600 bg-blue-50 text-blue-600'
                  : 'border-l-transparent text-gray-600 hover:bg-gray-50'
              }
              ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

// Scrollable Tabs Component
export const ScrollableTabs = ({
  tabs = [],
  defaultActiveTab = 0,
  onChange = null,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

  const handleTabChange = (index) => {
    setActiveTab(index);
    if (onChange) {
      onChange(index, tabs[index]);
    }
  };

  return (
    <div className={className}>
      <div className="flex overflow-x-auto gap-2 pb-2 border-b border-gray-200 scrollbar-hide">
        {tabs.map((tab, index) => (
          <button
            key={tab.id || index}
            onClick={() => handleTabChange(index)}
            className={`
              px-4 py-3 font-medium text-sm whitespace-nowrap
              border-b-2 transition duration-300 flex-shrink-0
              ${
                activeTab === index
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }
            `.trim()}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
};

export default Tabs;
