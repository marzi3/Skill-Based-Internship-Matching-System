'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

// Main Navbar Component
const Navbar = ({
  brand = 'InternMatch',
  logo = null,
  items = [],
  rightItems = [],
  sticky = true,
  shadow = true,
  variant = 'light',
  className = '',
  onMenuToggle = null,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (onMenuToggle) {
      onMenuToggle(!isMenuOpen);
    }
  };

  const variantClasses = {
    light: 'bg-white text-gray-900 border-b border-gray-200',
    dark: 'bg-gray-900 text-white border-b border-gray-800',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white',
  };

  const navClasses = `
    ${sticky ? 'sticky top-0 z-40' : ''}
    ${shadow ? 'shadow-md' : ''}
    ${variantClasses[variant]}
    ${className}
  `.trim();

  const isActive = (href) => pathname === href;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand/Logo */}
          <div className="flex items-center space-x-3">
            {logo ? (
              <img src={logo} alt={brand} className="h-8" />
            ) : (
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-lg
                ${variant === 'light' ? 'bg-blue-600' : 'bg-white'}
              `}>
                <span className={`
                  font-bold text-lg
                  ${variant === 'light' ? 'text-white' : 'text-blue-600'}
                `}>
                  IM
                </span>
              </div>
            )}
            <Link href="/" className={`text-xl font-bold hidden sm:block`}>
              {brand}
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item, index) => (
              <div key={index} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      className={`
                        px-3 py-2 rounded-md text-sm font-medium transition duration-300
                        ${isActive(item.href) 
                          ? 'bg-blue-100 text-blue-600'
                          : variant === 'light'
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-300 hover:bg-gray-800'
                        }
                      `}
                    >
                      {item.label}
                      <svg className="w-4 h-4 inline-block ml-1 group-hover:rotate-180 transition duration-300" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <div className="absolute left-0 mt-0 w-48 bg-white text-gray-900 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition duration-300 z-50">
                      {item.submenu.map((subitem, subindex) => (
                        <Link
                          key={subindex}
                          href={subitem.href}
                          className="block px-4 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      px-3 py-2 rounded-md text-sm font-medium transition duration-300
                      ${isActive(item.href)
                        ? 'bg-blue-100 text-blue-600'
                        : variant === 'light'
                        ? 'text-gray-700 hover:bg-gray-100'
                        : 'text-gray-300 hover:bg-gray-800'
                      }
                    `}
                  >
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </div>

          {/* Right Items */}
          <div className="hidden md:flex items-center space-x-4">
            {rightItems}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden flex flex-col space-y-1"
          >
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${
                isMenuOpen ? 'rotate-45 translate-y-2' : ''
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${
                isMenuOpen ? 'opacity-0' : ''
              }`}
            ></span>
            <span
              className={`block w-6 h-0.5 bg-current transition-all ${
                isMenuOpen ? '-rotate-45 -translate-y-2' : ''
              }`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className={`md:hidden pb-4 space-y-2 ${
            variant === 'light' ? 'bg-gray-50' : 'bg-gray-800'
          }`}>
            {items.map((item, index) => (
              <div key={index}>
                <Link
                  href={item.href}
                  className={`
                    block px-3 py-2 rounded-md font-medium transition duration-300
                    ${isActive(item.href)
                      ? 'bg-blue-100 text-blue-600'
                      : variant === 'light'
                      ? 'text-gray-700 hover:bg-gray-100'
                      : 'text-gray-300 hover:bg-gray-700'
                    }
                  `}
                >
                  {item.label}
                </Link>
                {item.submenu && (
                  <div className="pl-4 space-y-1">
                    {item.submenu.map((subitem, subindex) => (
                      <Link
                        key={subindex}
                        href={subitem.href}
                        className={`
                          block px-3 py-2 text-sm rounded-md
                          ${variant === 'light'
                            ? 'text-gray-600 hover:bg-gray-100'
                            : 'text-gray-400 hover:bg-gray-700'
                          }
                        `}
                      >
                        {subitem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
};

// Search Bar Component
export const SearchBar = ({ placeholder = 'Search...', onSearch = null, variant = 'light' }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSearch = (value) => {
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`
      hidden md:flex items-center gap-2 px-4 py-2 rounded-lg
      ${isFocused ? 'ring-2 ring-blue-500' : ''}
      ${variant === 'light' ? 'bg-gray-100' : 'bg-gray-700'}
      transition duration-300
    `}>
      <svg className={`w-5 h-5 ${variant === 'light' ? 'text-gray-500' : 'text-gray-400'}`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
      </svg>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          bg-transparent outline-none text-sm font-medium
          ${variant === 'light' ? 'text-gray-900 placeholder-gray-500' : 'text-white placeholder-gray-500'}
        `}
      />
    </div>
  );
};

// Notification Bell Component
export const NotificationBell = ({ count = 0, onClick = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (onClick) onClick(!isOpen);
        }}
        className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition duration-300"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-bold text-gray-900">Notifications</h3>
          </div>
          <div className="p-4 text-center text-gray-500">
            <p>No new notifications</p>
          </div>
        </div>
      )}
    </div>
  );
};

// User Menu Component
export const UserMenu = ({ user = null, onLogout = null }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition duration-300"
      >
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
        <span className="hidden sm:inline text-sm font-medium text-gray-900">
          {user?.name || 'User'}
        </span>
        <svg className={`w-4 h-4 text-gray-900 transition duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50 py-2">
          <div className="px-4 py-2 border-b border-gray-200">
            <p className="text-sm font-semibold text-gray-900">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
          </div>

          <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            My Profile
          </Link>
          <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            Settings
          </Link>
          <Link href="/applications" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
            My Applications
          </Link>

          <div className="border-t border-gray-200 mt-2 pt-2">
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Breadcrumb Component
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex items-center gap-2 text-sm">
      <Link href="/" className="text-blue-600 hover:underline">
        Home
      </Link>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span className="text-gray-400">/</span>
          {item.href ? (
            <Link href={item.href} className="text-blue-600 hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Navbar;
