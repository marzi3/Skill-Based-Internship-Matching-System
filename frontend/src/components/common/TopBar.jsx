'use client';

import React from 'react';
import { Search, Bell } from 'lucide-react';
import Input from './Input';

export default function TopBar({ navigationItems = [] }) {
  return (
    <header className="flex items-center justify-between px-8 py-4 border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="flex items-center gap-8">
        <nav className="flex items-center gap-6 text-sm text-slate-500">
          {navigationItems.length > 0 ? (
            navigationItems.map((item, index) => (
              <span
                key={index}
                className="hover:text-slate-900 cursor-pointer transition-colors"
              >
                {item}
              </span>
            ))
          ) : (
            <>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">📁 Student Dashboard</span>
              <span className="hover:text-slate-900 cursor-pointer transition-colors">⚙️ Settings</span>
            </>
          )}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-3 py-2 w-56 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
