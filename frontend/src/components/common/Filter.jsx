'use client';

import React from 'react';

// Filter Component
const Filter = ({
  title = 'Filter',
  filters = [],
  onApply = null,
  onReset = null,
  className = '',
}) => {
  const [activeFilters, setActiveFilters] = React.useState({});

  const handleFilterChange = (filterId, value) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleApply = () => {
    if (onApply) {
      onApply(activeFilters);
    }
  };

  const handleReset = () => {
    setActiveFilters({});
    if (onReset) {
      onReset();
    }
  };

  const activeCount = Object.values(activeFilters).filter((v) => v).length;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`.trim()}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {title}
          {activeCount > 0 && (
            <span className="ml-2 text-sm font-medium text-blue-600">
              ({activeCount})
            </span>
          )}
        </h3>

        {activeCount > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition duration-300"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Groups */}
      <div className="space-y-6">
        {filters.map((filter, index) => (
          <div key={index} className="pb-6 border-b border-gray-200 last:border-b-0 last:pb-0">
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
              {filter.label}
            </h4>

            <div className="space-y-2">
              {filter.options.map((option, optIndex) => (
                <label key={optIndex} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type={filter.type === 'radio' ? 'radio' : 'checkbox'}
                    name={filter.id}
                    value={option.value}
                    checked={activeFilters[filter.id] === option.value}
                    onChange={() => handleFilterChange(filter.id, option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                  {option.count && (
                    <span className="text-xs text-gray-500">({option.count})</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
        >
          Apply Filters
        </button>
        <button
          onClick={handleReset}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-300 font-medium"
        >
          Clear All
        </button>
      </div>
    </div>
  );
};

// Quick Filter Chips
export const FilterChips = ({
  filters = [],
  onFilterChange = null,
  className = '',
}) => {
  const [active, setActive] = React.useState(filters[0]?.value || null);

  const handleFilter = (value) => {
    setActive(value);
    if (onFilterChange) onFilterChange(value);
  };

  return (
    <div className={`flex gap-2 flex-wrap ${className}`.trim()}>
      {filters.map((filter, index) => (
        <button
          key={index}
          onClick={() => handleFilter(filter.value)}
          className={`
            px-4 py-2 rounded-full font-medium text-sm transition duration-300
            ${active === filter.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `.trim()}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
};

export default Filter;
