'use client';

import React from 'react';

// Main Loader Component with multiple variants
const Loader = ({
  variant = 'spinner',
  size = 'md',
  color = 'blue',
  text = '',
  fullScreenOverlay = false,
  className = '',
}) => {
  // Size mapping for different variants
  const sizeMap = {
    sm: { spinner: 'w-6 h-6', dots: 'w-2 h-2', pulse: 'w-12 h-12' },
    md: { spinner: 'w-12 h-12', dots: 'w-3 h-3', pulse: 'w-16 h-16' },
    lg: { spinner: 'w-16 h-16', dots: 'w-4 h-4', pulse: 'w-24 h-24' },
  };

  // Color mapping
  const colorMap = {
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    red: 'text-red-600',
    purple: 'text-purple-600',
    white: 'text-white',
  };

  const containerClasses = fullScreenOverlay
    ? 'fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center'
    : 'flex items-center justify-center';

  return (
    <div className={containerClasses}>
      <div className={`flex flex-col items-center gap-4 ${className}`.trim()}>
        {/* Spinner Variant */}
        {variant === 'spinner' && (
          <svg
            className={`${sizeMap[size].spinner} ${colorMap[color]} animate-spin`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        )}

        {/* Dots Variant */}
        {variant === 'dots' && (
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`${sizeMap[size].dots} ${colorMap[color]} rounded-full animate-bounce`}
                style={{
                  animationDelay: `${i * 0.15}s`,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Pulse Variant */}
        {variant === 'pulse' && (
          <div
            className={`${sizeMap[size].pulse} ${colorMap[color]} rounded-full animate-pulse`}
          ></div>
        )}

        {/* Bar Variant */}
        {variant === 'bar' && (
          <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${
                color === 'blue' ? 'bg-blue-600' : `bg-${color}-600`
              } animate-pulse`}
              style={{
                width: '30%',
                animation: 'slide 2s infinite',
              }}
            ></div>
          </div>
        )}

        {/* Twin Circles Variant */}
        {variant === 'circles' && (
          <div className="flex gap-4">
            <div
              className={`${sizeMap[size].pulse} ${colorMap[color]} rounded-full border-4 border-transparent border-t-current animate-spin`}
            ></div>
          </div>
        )}

        {/* Skeleton Loader Variant */}
        {variant === 'skeleton' && (
          <div className="w-full space-y-3">
            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6"></div>
          </div>
        )}

        {/* Loading Text */}
        {text && (
          <p className="text-gray-700 font-medium text-sm text-center">{text}</p>
        )}
      </div>

      {/* CSS for slide animation */}
      <style>{`
        @keyframes slide {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

// Page Loader - Full screen with overlay
export const PageLoader = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-2xl">IM</span>
        </div>
        <p className="text-gray-700 font-medium">Loading...</p>
      </div>
    </div>
  );
};

// Table Loader - Skeleton for table rows
export const TableLoader = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          {Array.from({ length: columns }).map((_, j) => (
            <div
              key={j}
              className="flex-1 h-12 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

// Card Loader - Skeleton for card content
export const CardLoader = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg shadow-md p-6 space-y-4">
          {/* Image placeholder */}
          <div className="w-full h-48 bg-gray-200 rounded-lg animate-pulse"></div>
          {/* Title */}
          <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          {/* Subtitle */}
          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          {/* Description lines */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6 animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Inline Loader - Small loader for inline loading states
export const InlineLoader = ({ size = 'sm', color = 'blue', text = '' }) => {
  return (
    <div className="inline-flex items-center gap-2">
      <svg
        className={`w-4 h-4 text-${color}-600 animate-spin`}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      {text && <span className="text-sm text-gray-700 font-medium">{text}</span>}
    </div>
  );
};

// Progress Bar Loader
export const ProgressLoader = ({ progress = 45, showLabel = true }) => {
  return (
    <div className="w-full space-y-2">
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {showLabel && (
        <p className="text-xs text-gray-600 text-right font-medium">
          {progress}%
        </p>
      )}
    </div>
  );
};

// Shimmer Effect Loader
export const ShimmerLoader = ({ width = 'w-full', height = 'h-12' }) => {
  return (
    <div
      className={`${width} ${height} bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded animate-pulse`}
      style={{
        backgroundSize: '200% 100%',
        animation: 'shimmer 2s infinite',
      }}
    >
      <style>{`
        @keyframes shimmer {
          0% {
            backgroundPosition: 200% 0;
          }
          100% {
            backgroundPosition: -200% 0;
          }
        }
      `}</style>
    </div>
  );
};

// Button Loader - For use inside buttons
export const ButtonLoader = () => {
  return (
    <svg
      className="w-5 h-5 text-white animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  );
};

export default Loader;
