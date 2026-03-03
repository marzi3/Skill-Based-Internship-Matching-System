'use client';

import React from 'react';

// Badge Component
const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  icon = null,
  closable = false,
  onClose = null,
  className = '',
}) => {
  const variantStyles = {
    primary: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-cyan-100 text-cyan-800',
    light: 'bg-gray-50 text-gray-700 border border-gray-200',
    dark: 'bg-gray-800 text-white',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2',
  };

  return (
    <span
      className={`
        inline-flex items-center gap-2 font-semibold rounded-full
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `.trim()}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
      {closable && (
        <button
          onClick={onClose}
          className="ml-1 hover:opacity-70 transition duration-300"
          aria-label="Remove badge"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

// Status Badge Component
export const StatusBadge = ({ status = 'active', className = '' }) => {
  const statusStyles = {
    active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
    inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    completed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Completed' },
  };

  const style = statusStyles[status] || statusStyles.inactive;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-full
        ${style.bg} ${style.text}
        ${className}
      `.trim()}
    >
      <span className="w-2 h-2 rounded-full bg-current"></span>
      {style.label}
    </span>
  );
};

// Dot Badge (for notifications)
export const DotBadge = ({ count = 0, color = 'red', className = '' }) => {
  if (count === 0) return null;

  const colorStyles = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
  };

  return (
    <span
      className={`
        inline-flex items-center justify-center w-5 h-5 text-xs font-bold
        text-white ${colorStyles[color]} rounded-full
        ${className}
      `.trim()}
    >
      {count > 99 ? '99+' : count}
    </span>
  );
};

export default Badge;
