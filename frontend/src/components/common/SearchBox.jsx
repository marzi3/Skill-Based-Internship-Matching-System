'use client';

import React, { useState } from 'react';

// Search Box Component
const SearchBox = ({
  placeholder = 'Search...',
  value = '',
  onChange = null,
  onSearch = null,
  onClear = null,
  suggestions = [],
  debounceMs = 300,
  className = '',
  icon = true,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = React.useRef(null);

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (onChange) onChange(newValue);

    // Debounce search
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (onSearch) onSearch(newValue);
    }, debounceMs);

    if (newValue) {
      setShowSuggestions(true);
    }
  };

  const handleClear = () => {
    if (onChange) onChange('');
    if (onClear) onClear();
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion) => {
    if (onChange) onChange(suggestion);
    if (onSearch) onSearch(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className={`relative w-full ${className}`.trim()}>
      <div className="relative flex items-center">
        {icon && (
          <svg className="absolute left-3 w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
        )}

        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={() => {
            setIsFocused(true);
            if (value) setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-2.5 border rounded-lg transition duration-300 font-medium
            ${icon ? 'pl-10' : ''}
            ${value && !isFocused ? 'pr-10' : ''}
            ${isFocused
              ? 'border-blue-600 ring-2 ring-blue-200'
              : 'border-gray-300 hover:border-gray-400'
            }
          `.trim()}
        />

        {value && (
          <button
            onClick={handleClear}
            className="absolute right-3 text-gray-500 hover:text-gray-600 transition duration-300"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-64 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 transition duration-300 text-gray-700 font-medium text-sm first:rounded-t-lg last:rounded-b-lg"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
