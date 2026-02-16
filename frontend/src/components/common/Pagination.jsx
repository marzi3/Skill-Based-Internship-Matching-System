'use client';

import React, { useState, useCallback } from 'react';

// Main Pagination Component
const Pagination = ({
  currentPage = 1,
  totalPages = 10,
  totalItems = 100,
  itemsPerPage = 10,
  onPageChange = () => {},
  variant = 'default',
  size = 'md',
  showItemsPerPage = true,
  showTotalItems = true,
  maxVisiblePages = 7,
  className = '',
}) => {
  const [itemsPerPageState, setItemsPerPageState] = useState(itemsPerPage);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        onPageChange(page);
      }
    },
    [totalPages, onPageChange]
  );

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPageState(newItemsPerPage);
    onPageChange(1); // Reset to first page
  };

  // Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page and ellipsis
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('...');
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Size styles
  const sizeClasses = {
    sm: 'text-sm px-2 py-1',
    md: 'text-base px-3 py-2',
    lg: 'text-lg px-4 py-3',
  };

  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-gray-300',
    primary: 'bg-blue-600 text-white border-blue-600',
    outlined: 'bg-transparent border-2 border-blue-600 text-blue-600',
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className={`flex flex-col gap-4 items-center justify-between ${className}`.trim()}>
      {/* Items per page selector */}
      {showItemsPerPage && (
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Items per page:</label>
          <select
            value={itemsPerPageState}
            onChange={handleItemsPerPageChange}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      )}

      {/* Pagination controls */}
      <div className="flex items-center gap-2">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`
            ${sizeClasses[size]}
            rounded-lg transition duration-300
            ${currentPage === 1
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : `${variantClasses.default} hover:shadow-md active:scale-95`
            }
          `}
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className={`${sizeClasses[size]} text-gray-500 font-medium`}>
                ...
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={`
                  ${sizeClasses[size]}
                  rounded-lg transition duration-300 font-medium
                  ${currentPage === page
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white border border-gray-300 text-gray-900 hover:shadow-md active:scale-95'
                  }
                `}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`
            ${sizeClasses[size]}
            rounded-lg transition duration-300
            ${currentPage === totalPages
              ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400'
              : `${variantClasses.default} hover:shadow-md active:scale-95`
            }
          `}
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Total items info */}
      {showTotalItems && (
        <p className="text-sm text-gray-600 font-medium">
          Showing {(currentPage - 1) * itemsPerPageState + 1} to{' '}
          {Math.min(currentPage * itemsPerPageState, totalItems)} of {totalItems}{' '}
          results
        </p>
      )}
    </div>
  );
};

// Simple Pagination Component (minimal style)
export const SimplePagination = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange = () => {},
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-2 justify-center ${className}`.trim()}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Back
      </button>

      <span className="px-4 py-1 text-sm font-medium text-gray-700">
        Page {currentPage} of {totalPages}
      </span>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
};

// Compact Pagination Component
export const CompactPagination = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange = () => {},
  className = '',
}) => {
  const [inputPage, setInputPage] = React.useState(currentPage);

  const handleGoToPage = () => {
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  return (
    <div className={`flex items-center gap-3 justify-center ${className}`.trim()}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <label className="text-sm text-gray-600">Go to:</label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            min="1"
            max={totalPages}
            value={inputPage}
            onChange={(e) => setInputPage(e.target.value)}
            className="w-12 px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">/ {totalPages}</span>
        </div>
        <button
          onClick={handleGoToPage}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition duration-300"
        >
          Go
        </button>
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Dots Pagination Component (good for mobile)
export const DotsPagination = ({
  currentPage = 1,
  totalPages = 10,
  onPageChange = () => {},
  maxDots = 5,
  className = '',
}) => {
  const dots = [];
  const gap = Math.ceil(totalPages / maxDots);

  for (let i = 1; i <= totalPages; i += gap) {
    dots.push(i);
  }

  // Always include last page
  if (!dots.includes(totalPages)) {
    dots.push(totalPages);
  }

  return (
    <div className={`flex items-center gap-4 justify-center ${className}`.trim()}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      </button>

      <div className="flex items-center gap-1.5">
        {dots.map((dot) => (
          <button
            key={dot}
            onClick={() => onPageChange(dot)}
            className={`
              w-2 h-2 rounded-full transition duration-300
              ${currentPage === dot ? 'bg-blue-600 w-8' : 'bg-gray-300 hover:bg-gray-400'}
            `}
            aria-label={`Go to page ${dot}`}
          />
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414 1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// usePagination Hook
export const usePagination = (initialPage = 1, totalPages = 10) => {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const goToPage = React.useCallback((page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = React.useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = React.useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    goToPage,
    nextPage,
    prevPage,
  };
};

export default Pagination;
