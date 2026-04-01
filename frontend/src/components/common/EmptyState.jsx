'use client';

import React from 'react';

// Empty State Component
const EmptyState = ({
  icon = null,
  title = 'No results found',
  description = '',
  action = null,
  className = '',
}) => {
  return (
    <div className={`
      flex flex-col items-center justify-center py-12 px-4
      ${className}
    `.trim()}>
      {icon && (
        <div className="mb-4 text-gray-500">
          {typeof icon === 'string' ? (
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              {/* Generic empty icon */}
            </svg>
          ) : (
            icon
          )}
        </div>
      )}

      <h3 className="text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>

      {description && (
        <p className="text-gray-500 text-center mb-6 max-w-md">
          {description}
        </p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// No Data Empty State
export const NoDataEmptyState = ({ action = null }) => {
  return (
    <EmptyState
      title="No data available"
      description="There's no data to display right now. Try adjusting your filters or check back later."
      action={action}
    />
  );
};

// Search Not Found Empty State
export const SearchNotFoundEmptyState = ({ query = '', action = null }) => {
  return (
    <EmptyState
      title="No results found"
      description={`We couldn't find any results for "${query}". Try a different search term.`}
      action={action}
    />
  );
};

// No Internships Empty State
export const NoInternshipsEmptyState = ({ action = null }) => {
  return (
    <EmptyState
      title="No internships found"
      description="There are currently no internships matching your criteria. Check back later or adjust your filters."
      action={action || { label: 'Browse All Internships', onClick: () => {} }}
    />
  );
};

export default EmptyState;
