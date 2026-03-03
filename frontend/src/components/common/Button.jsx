'use client';

import React from 'react';

const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  icon: Icon = null,
  iconPosition = 'left',
  ...props
}) => {
  // Base styles
  const baseStyles =
    'font-semibold rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 inline-flex items-center justify-center gap-2 cursor-pointer';

  // Size variants
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
    xl: 'px-10 py-4 text-xl',
  };

  // Color variants
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800 shadow-md hover:shadow-lg disabled:bg-blue-300 disabled:cursor-not-allowed',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-400 active:bg-gray-400 shadow-sm hover:shadow-md disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800 shadow-md hover:shadow-lg disabled:bg-green-300 disabled:cursor-not-allowed',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800 shadow-md hover:shadow-lg disabled:bg-red-300 disabled:cursor-not-allowed',
    warning: 'bg-yellow-600 text-white hover:bg-yellow-700 focus:ring-yellow-500 active:bg-yellow-800 shadow-md hover:shadow-lg disabled:bg-yellow-300 disabled:cursor-not-allowed',
    info: 'bg-cyan-600 text-white hover:bg-cyan-700 focus:ring-cyan-500 active:bg-cyan-800 shadow-md hover:shadow-lg disabled:bg-cyan-300 disabled:cursor-not-allowed',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100 disabled:border-blue-300 disabled:text-blue-300 disabled:cursor-not-allowed',
    ghost: 'text-blue-600 hover:bg-blue-50 focus:ring-blue-500 active:bg-blue-100 disabled:text-blue-300 disabled:cursor-not-allowed',
    gradient: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg focus:ring-blue-500 active:opacity-90 shadow-md disabled:opacity-50 disabled:cursor-not-allowed',
  };

  // Combine all styles
  const buttonClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${fullWidth ? 'w-full' : ''}
    ${loading ? 'opacity-70 cursor-not-allowed' : ''}
    ${className}
  `.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={buttonClasses}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <svg
          className="animate-spin h-5 w-5"
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

      {/* Icon and Text */}
      {Icon && iconPosition === 'left' && !loading && <Icon size={20} />}
      <span>{loading ? 'Loading...' : children}</span>
      {Icon && iconPosition === 'right' && !loading && <Icon size={20} />}
    </button>
  );
};

export default Button;
