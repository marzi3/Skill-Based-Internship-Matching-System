'use client';

import React, { useState, useRef, useEffect } from 'react';

// Menu Component
const Menu = ({
  items = [],
  trigger = null,
  placement = 'bottom-start',
  className = '',
  onItemClick = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !triggerRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setIsOpen(false);
  };

  const placementClasses = {
    'top-start': 'bottom-full mb-2 left-0',
    'top-center': 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    'top-end': 'bottom-full mb-2 right-0',
    'bottom-start': 'top-full mt-2 left-0',
    'bottom-center': 'top-full mt-2 left-1/2 -translate-x-1/2',
    'bottom-end': 'top-full mt-2 right-0',
    'left-start': 'right-full mr-2 top-0',
    'left-center': 'right-full mr-2 top-1/2 -translate-y-1/2',
    'left-end': 'right-full mr-2 bottom-0',
    'right-start': 'left-full ml-2 top-0',
    'right-center': 'left-full ml-2 top-1/2 -translate-y-1/2',
    'right-end': 'left-full ml-2 bottom-0',
  };

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger || (
          <button className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.5 1.5H9.5V3.5H10.5V1.5ZM10.5 8.5H9.5V17.5H10.5V8.5Z" />
              <circle cx="10" cy="5.5" r="1" />
              <circle cx="10" cy="15.5" r="1" />
            </svg>
          </button>
        )}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          className={`
            absolute ${placementClasses[placement]} z-50
            bg-white rounded-lg shadow-lg border border-gray-200
            overflow-hidden min-w-48 py-1
          `.trim()}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div key={index} className="border-t border-gray-200 my-1"></div>
              );
            }

            const isDisabled = item.disabled || false;

            return (
              <button
                key={index}
                onClick={() => !isDisabled && handleItemClick(item)}
                disabled={isDisabled}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center gap-3 transition duration-200
                  ${
                    isDisabled
                      ? 'text-gray-500 cursor-not-allowed'
                      : 'text-gray-900 hover:bg-gray-100 cursor-pointer'
                  }
                  ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : ''}
                  ${item.success ? 'hover:bg-green-50 hover:text-green-600' : ''}
                `.trim()}
              >
                {item.icon && (
                  <span className="w-5 h-5 flex-shrink-0">{item.icon}</span>
                )}
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                    {item.badge}
                  </span>
                )}
                {item.shortcut && (
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Context Menu Component
export const ContextMenu = ({ children, items = [], onItemClick = null }) => {
  const [contextMenu, setContextMenu] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setContextMenu(null);
  };

  return (
    <div ref={containerRef} onContextMenu={handleContextMenu}>
      {children}

      {contextMenu && (
        <div
          className="fixed z-50 bg-white rounded-lg shadow-lg border border-gray-200 py-1 min-w-48"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div key={index} className="border-t border-gray-200 my-1"></div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center gap-3 transition duration-200
                  hover:bg-gray-100 text-gray-900
                  ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `.trim()}
              >
                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Action Menu (Three dots menu)
export const ActionMenu = ({ actions = [], size = 'md', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block ${className}`.trim()}>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          ${sizeClasses[size]} flex items-center justify-center
          rounded-lg hover:bg-gray-100 transition duration-300
        `.trim()}
      >
        <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          <path d="M10.5 14a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          <path d="M10.5 2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          {actions.map((action, index) => {
            if (action.separator) {
              return (
                <div key={index} className="border-t border-gray-200 my-1"></div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleActionClick(action)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center gap-3 transition duration-200
                  hover:bg-gray-100 text-gray-900
                  ${action.danger ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `.trim()}
              >
                {action.icon && <span className="w-5 h-5">{action.icon}</span>}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Dropdown Menu (Similar to Menu but with different trigger style)
export const DropdownMenu = ({
  label = 'Actions',
  items = [],
  variant = 'primary',
  onItemClick = null,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const handleItemClick = (item) => {
    if (item.onClick) {
      item.onClick();
    }
    if (onItemClick) {
      onItemClick(item);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          px-4 py-2.5 rounded-lg font-medium text-sm
          flex items-center gap-2 transition duration-300
          ${variantClasses[variant]}
        `.trim()}
      >
        {label}
        <svg
          className={`w-4 h-4 transition duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-full mt-2 left-0 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
        >
          {items.map((item, index) => {
            if (item.separator) {
              return (
                <div key={index} className="border-t border-gray-200 my-1"></div>
              );
            }

            return (
              <button
                key={index}
                onClick={() => handleItemClick(item)}
                className={`
                  w-full px-4 py-2.5 text-left text-sm font-medium
                  flex items-center gap-3 transition duration-200
                  hover:bg-gray-100 text-gray-900
                  ${item.danger ? 'hover:bg-red-50 hover:text-red-600' : ''}
                `.trim()}
              >
                {item.icon && <span className="w-5 h-5">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Menu;
