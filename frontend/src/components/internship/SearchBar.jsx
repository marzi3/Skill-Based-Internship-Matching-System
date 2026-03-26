'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';

/**
 * Premium SearchBar Component
 * Features: Debounced searching, clear button, loading state, and premium aesthetics.
 * 
 * @param {Object} props
 * @param {string} props.placeholder - Input placeholder
 * @param {Function} props.onSearch - Callback for debounced search
 * @param {number} props.debounceMs - Debounce delay in milliseconds
 * @param {string} props.initialValue - Initial value for the search bar
 * @param {boolean} props.isLoading - External loading state
 * @param {string} props.className - Additional CSS classes
 */
const SearchBar = ({
  placeholder = 'Search by position, skill, or company...',
  onSearch,
  initialValue = '',
  isLoading = false,
  className = '',
  showSubmitButton = true,
}) => {
  const [value, setValue] = useState(initialValue);
  const [isFocused, setIsFocused] = useState(false);

  // Synchronize internal state with initialValue if it changes externally
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleChange = (e) => {
    const newVal = e.target.value;
    setValue(newVal);
    // If button is hidden, we sync with parent immediately so the parent button has the right query
    if (!showSubmitButton && onSearch) onSearch(newVal);
  };

  const handleClear = () => {
    setValue('');
    if (onSearch) onSearch('');
  };

  const handleSubmit = (e) => {
    if (e && e.type === 'submit') e.preventDefault();
    if (onSearch) onSearch(value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && showSubmitButton) {
      handleSubmit(e);
    }
  };

  const Component = showSubmitButton ? 'form' : 'div';
  
  return (
    <Component 
      onSubmit={showSubmitButton ? handleSubmit : undefined}
      onKeyDown={handleKeyDown}
      className={`relative group w-full ${className}`.trim()}
    >
      <div className={`
        relative flex items-center transition-all duration-300
        bg-white border-2 rounded-2xl overflow-hidden
        ${isFocused 
          ? 'border-indigo-500 ring-4 ring-indigo-500/10 shadow-lg' 
          : 'border-slate-100 hover:border-slate-200 shadow-sm'
        }
      `}>
        {/* Search Icon */}
        <div className={`
          pl-4 pr-2 transition-colors duration-300
          ${isFocused ? 'text-indigo-500' : 'text-slate-400'}
        `}>
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Search className="w-5 h-5" />
          )}
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full py-4 pr-32 text-slate-800 placeholder:text-slate-400 font-bold bg-transparent outline-none text-sm lg:text-base"
        />

        {/* Action Buttons */}
        <div className="absolute right-2 flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-rose-500 transition-all"
              title="Clear search"
            >
              <X size={18} />
            </button>
          )}
          {showSubmitButton && (
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Search size={16} />
              <span>Search</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Decorative Gradient Background (Glassmorphism effect) */}
      <div className={`
        absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-[1.25rem] blur opacity-0 
        group-hover:opacity-10 group-focus-within:opacity-20 transition duration-1000 -z-10
      `} />
    </Component>
  );
};

export default SearchBar;
