'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Mock user data - replace with actual auth logic
  const isLoggedIn = false;
  const userRole = 'student'; // 'student', 'employer', or 'admin'

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
              <span className="text-white font-bold text-lg">IM</span>
            </div>
            <Link href="/" className="text-xl font-bold text-gray-900">
              InternMatch
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/browse"
              className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium"
            >
              Browse Internships
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 transition duration-300 font-medium"
            >
              Contact
            </Link>
          </div>

          {/* Right Side - Auth & Menu */}
          <div className="flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Link
                  href="/login"
                  className="hidden md:block text-gray-700 hover:text-blue-600 font-medium transition duration-300"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition duration-300"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={toggleUserDropdown}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition duration-300"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold">U</span>
                  </div>
                  <span className="hidden md:inline font-medium">Account</span>
                </button>

                {/* User Dropdown Menu */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/applications"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Applications
                    </Link>
                    <hr className="my-2" />
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={() => {
                        // Handle logout
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden flex flex-col space-y-1 text-gray-900 focus:outline-none"
            >
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-all ${
                  isMenuOpen ? 'rotate-45 translate-y-2' : ''
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-all ${
                  isMenuOpen ? 'opacity-0' : ''
                }`}
              ></span>
              <span
                className={`block w-6 h-0.5 bg-gray-900 transition-all ${
                  isMenuOpen ? '-rotate-45 -translate-y-2' : ''
                }`}
              ></span>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-gray-50 py-4 px-4 rounded-b-lg">
            <div className="flex flex-col space-y-3">
              <Link
                href="/browse"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Browse Internships
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-blue-600 font-medium"
              >
                Contact
              </Link>
              {!isLoggedIn && (
                <>
                  <hr className="my-2" />
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-blue-600 font-medium"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
