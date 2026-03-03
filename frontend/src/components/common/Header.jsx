'use client';

import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-primary-200/80 bg-gradient-to-r from-primary-500 via-primary-600 to-secondary-300 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 px-6 py-6 lg:px-8" aria-label="Global">

        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center gap-2 group">
            <img src="/images/logo.png" alt="IM Logo" className="h-12 w-auto object-contain drop-shadow-sm" />
            <span className="text-white font-semibold text-lg tracking-tight hidden sm:inline drop-shadow-sm">InternMatch</span>
          </Link>
        </div>

        {/* Navigation Links - Always Horizontal */}
        <div className="flex items-center gap-x-4 lg:gap-x-8 flex-1 justify-center">
          <Link href="/browse" className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors whitespace-nowrap">
            Browse
          </Link>
          <Link href="/about" className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors whitespace-nowrap">
            About
          </Link>
          <Link href="/contact" className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white transition-colors whitespace-nowrap">
            Contact
          </Link>
        </div>

        {/* Auth Buttons - Always Horizontal */}
        <div className="flex items-center gap-x-2 lg:gap-x-3 flex-shrink-0">
          <Link
            href="/login"
            className="text-xs sm:text-sm font-semibold text-white/90 hover:text-white px-2 sm:px-3 py-2 rounded-md hover:bg-white/10 transition-colors whitespace-nowrap"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-white text-primary-600 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold shadow-sm hover:bg-white/90 hover:scale-105 transition-all whitespace-nowrap"
          >
            Sign up
          </Link>
        </div>
      </nav>
    </header>
  );
}

