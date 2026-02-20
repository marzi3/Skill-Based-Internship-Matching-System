'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Main Sidebar Component
const Sidebar = ({
  items = [],
  logo = '/images/logo.png',
  brand = 'InternMatch',
  isOpen = true,
  onToggle = null,
  variant = 'light',
  collapsible = true,
  width = 'w-64',
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState(!isOpen);
  const [expandedItems, setExpandedItems] = useState({});
  const pathname = usePathname();

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) {
      onToggle(!collapsed);
    }
  };

  const toggleSubmenu = (id) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isActive = (href) => pathname === href;

  const variantClasses = {
    light: 'bg-white border-r border-gray-200',
    dark: 'bg-gray-900',
    gradient: 'bg-gradient-to-b from-blue-600 to-indigo-600',
  };

  const textColor = {
    light: 'text-gray-900',
    dark: 'text-white',
    gradient: 'text-white',
  };

  const sidebarClasses = `
    ${collapsed ? 'w-20' : width}
    h-screen sticky top-0 overflow-y-auto transition-all duration-300
    ${variantClasses[variant]}
    ${textColor[variant]}
    ${className}
  `.trim();

  return (
    <aside className={sidebarClasses}>
      {/* Brand Section */}
      <div className={`
        flex items-center justify-between p-4 border-b
        ${variant === 'light' ? 'border-gray-200' : 'border-gray-800'}
      `}>
        <div className="flex items-center gap-3">
          {logo ? (
            <img src={logo} alt={brand} className="h-8" />
          ) : (
            <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" />
          )}
          {!collapsed && (
            <span className="font-bold text-sm hidden sm:inline truncate">
              {brand}
            </span>
          )}
        </div>

        {collapsible && (
          <button
            onClick={handleToggle}
            className={`
              p-1 rounded hover:bg-gray-200 transition duration-300
              ${variant === 'dark' ? 'hover:bg-gray-800' : ''}
            `}
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {items.map((item, index) => (
          <div key={index}>
            {item.submenu ? (
              <>
                <button
                  onClick={() => toggleSubmenu(item.id || index)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition duration-300 font-medium
                    ${isActive(item.href)
                      ? variant === 'light'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-blue-900 text-blue-200'
                      : variant === 'light'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  {item.icon && (
                    <item.icon size={20} className="flex-shrink-0" />
                  )}
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left text-sm">
                        {item.label}
                      </span>
                      <svg
                        className={`
                          w-4 h-4 transition duration-300
                          ${expandedItems[item.id || index] ? 'rotate-180' : ''}
                        `}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>

                {/* Submenu */}
                {!collapsed && expandedItems[item.id || index] && (
                  <div className="ml-2 space-y-1 border-l-2 pl-4 mt-2" style={{
                    borderColor: variant === 'light' ? '#e5e7eb' : '#374151'
                  }}>
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className={`
                          block px-3 py-2 rounded-lg text-sm transition duration-300
                          ${isActive(subitem.href)
                            ? variant === 'light'
                              ? 'bg-blue-100 text-blue-600 font-medium'
                              : 'bg-blue-900 text-blue-200 font-medium'
                            : variant === 'light'
                              ? 'text-gray-600 hover:bg-gray-50'
                              : 'text-gray-400 hover:bg-gray-800'
                          }
                        `}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition duration-300 font-medium
                  ${isActive(item.href)
                    ? variant === 'light'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-blue-900 text-blue-200'
                    : variant === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-800'
                  }
                `}
              >
                {item.icon && (
                  <item.icon size={20} className="flex-shrink-0" />
                )}
                {!collapsed && (
                  <span className="text-sm">{item.label}</span>
                )}
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Divider */}
      {!collapsed && (
        <div className={`
          my-4 mx-4 h-px
          ${variant === 'light' ? 'bg-gray-200' : 'bg-gray-800'}
        `}></div>
      )}

      {/* Footer Section */}
      <div className={`
        p-4 space-y-2 border-t
        ${variant === 'light' ? 'border-gray-200' : 'border-gray-800'}
      `}>
        {!collapsed && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase">
              Support
            </p>
            <Link
              href="/help"
              className={`
                flex items-center gap-2 text-sm px-3 py-2 rounded-lg
                transition duration-300
                ${variant === 'light'
                  ? 'text-gray-600 hover:bg-gray-100'
                  : 'text-gray-400 hover:bg-gray-800'
                }
              `}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Help Center
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
};

// Collapsible Mobile Sidebar
export const MobileSidebar = ({
  isOpen = false,
  onClose = () => { },
  items = [],
  brand = 'InternMatch',
}) => {
  const pathname = usePathname();

  const isActive = (href) => pathname === href;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-50 md:hidden overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{brand}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-300"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              onClick={onClose}
              className={`
                flex items-center gap-3 px-4 py-2.5 rounded-lg
                transition duration-300 font-medium
                ${isActive(item.href)
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              {item.icon && <item.icon size={20} />}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
};

// Sidebar with sections (grouped menu items)
export const SidebarWithSections = ({
  sections = [],
  isOpen = true,
  onToggle = null,
  variant = 'light',
  className = '',
}) => {
  const [collapsed, setCollapsed] = useState(!isOpen);
  const pathname = usePathname();

  const handleToggle = () => {
    setCollapsed(!collapsed);
    if (onToggle) onToggle(!collapsed);
  };

  const isActive = (href) => pathname === href;

  const variantClasses = {
    light: 'bg-white border-r border-gray-200',
    dark: 'bg-gray-900',
  };

  return (
    <aside className={`
      ${collapsed ? 'w-20' : 'w-64'}
      h-screen sticky top-0 overflow-y-auto transition-all duration-300
      ${variantClasses[variant]}
      ${className}
    `}>
      {/* Header */}
      <div className={`
        flex items-center justify-between p-4
        ${variant === 'light' ? 'border-b border-gray-200' : 'border-b border-gray-800'}
      `}>
        <img src="/images/logo.png" alt="Logo" className="h-10 w-auto object-contain" />

        <button
          onClick={handleToggle}
          className={`p-1 rounded hover:bg-gray-200 transition duration-300 ${variant === 'dark' ? 'hover:bg-gray-800' : ''
            }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Sections */}
      <div className="p-4 space-y-6">
        {sections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {!collapsed && section.title && (
              <h3 className={`
                text-xs font-bold uppercase tracking-wider mb-3
                ${variant === 'light' ? 'text-gray-500' : 'text-gray-400'}
              `}>
                {section.title}
              </h3>
            )}

            <div className="space-y-1">
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-lg
                    transition duration-300 font-medium text-sm
                    ${isActive(item.href)
                      ? variant === 'light'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-blue-900 text-blue-200'
                      : variant === 'light'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300 hover:bg-gray-800'
                    }
                  `}
                >
                  {item.icon && (
                    <item.icon size={18} className="flex-shrink-0" />
                  )}
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
