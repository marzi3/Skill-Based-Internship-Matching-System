'use client';

import React, { useState } from 'react';

const Input = ({
  type = 'text',
  placeholder = '',
  label = '',
  value = '',
  onChange = null,
  onBlur = null,
  onFocus = null,
  disabled = false,
  required = false,
  error = '',
  hint = '',
  variant = 'default',
  size = 'md',
  icon: Icon = null,
  iconPosition = 'left',
  clearable = false,
  onClear = null,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  // Base styles
  const baseStyles =
    'w-full px-4 border transition duration-300 ease-in-out focus:outline-none font-medium';

  // Size styles
  const sizeStyles = {
    sm: 'py-1.5 text-sm rounded-md',
    md: 'py-2.5 text-base rounded-lg',
    lg: 'py-3 text-lg rounded-lg',
  };

  // Variant styles
  const variantStyles = {
    default: error
      ? 'border-red-500 bg-red-50 focus:border-red-600 focus:ring-2 focus:ring-red-200'
      : isFocused
      ? 'border-blue-600 bg-white focus:ring-2 focus:ring-blue-200'
      : 'border-gray-300 bg-white hover:border-gray-400',
    outlined: error
      ? 'border-2 border-red-500 bg-white focus:border-red-600 focus:ring-2 focus:ring-red-200'
      : isFocused
      ? 'border-2 border-blue-600 bg-white focus:ring-2 focus:ring-blue-200'
      : 'border-2 border-gray-300 bg-white hover:border-gray-400',
    ghost: 'border-0 bg-gray-100 hover:bg-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-300',
    filled: 'border-0 bg-gray-100 border-b-2 border-gray-300 hover:border-gray-400 focus:bg-gray-50 focus:border-blue-600',
  };

  // Disabled styles
  const disabledStyles = disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60' : '';

  // Combine input classes
  const inputClasses = `
    ${baseStyles}
    ${sizeStyles[size]}
    ${variantStyles[variant]}
    ${disabledStyles}
    ${Icon ? (iconPosition === 'left' ? 'pl-10' : 'pr-10') : ''}
    ${clearable && value ? (iconPosition === 'left' ? 'pr-10' : 'pl-10') : ''}
    ${className}
  `.trim();

  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
    if (onClear) {
      onClear();
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Wrapper */}
      <div className="relative">
        {/* Left Icon */}
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon
              size={20}
              className={isFocused ? 'text-blue-600' : 'text-gray-400'}
            />
          </div>
        )}

        {/* Input Field */}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        {/* Right Icon or Clear Button */}
        {(Icon && iconPosition === 'right') || (clearable && value) ? (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {clearable && value ? (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600 transition duration-200"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ) : Icon ? (
              <Icon
                size={20}
                className={isFocused ? 'text-blue-600' : 'text-gray-400'}
              />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Error Message */}
      {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}

      {/* Hint Text */}
      {hint && !error && (
        <p className="text-gray-500 text-xs mt-2">{hint}</p>
      )}
    </div>
  );
};

// TextArea Component
export const TextArea = ({
  label = '',
  placeholder = '',
  value = '',
  onChange = null,
  rows = 4,
  disabled = false,
  error = '',
  hint = '',
  required = false,
  maxLength = null,
  showCount = false,
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyles =
    'w-full px-4 py-3 border rounded-lg transition duration-300 ease-in-out focus:outline-none font-medium resize-none';

  const focusStyles = error
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
    : isFocused
    ? 'border-blue-600 focus:ring-2 focus:ring-blue-200'
    : 'border-gray-300 hover:border-gray-400';

  const textareaClasses = `${baseStyles} ${focusStyles} ${
    disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60' : 'bg-white'
  } ${className}`.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={textareaClasses}
          {...props}
        />

        {showCount && maxLength && (
          <p className="text-xs text-gray-500 mt-1 text-right">
            {value.length}/{maxLength}
          </p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
      {hint && !error && <p className="text-gray-500 text-xs mt-2">{hint}</p>}
    </div>
  );
};

// Select Component
export const Select = ({
  label = '',
  placeholder = 'Select an option',
  value = '',
  onChange = null,
  options = [],
  disabled = false,
  error = '',
  hint = '',
  required = false,
  size = 'md',
  className = '',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyles =
    'w-full px-4 border rounded-lg transition duration-300 ease-in-out focus:outline-none font-medium appearance-none cursor-pointer bg-white';

  const sizeStyles = {
    sm: 'py-1.5 text-sm',
    md: 'py-2.5 text-base',
    lg: 'py-3 text-lg',
  };

  const focusStyles = error
    ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
    : isFocused
    ? 'border-blue-600 focus:ring-2 focus:ring-blue-200'
    : 'border-gray-300 hover:border-gray-400';

  const selectClasses = `${baseStyles} ${sizeStyles[size]} ${focusStyles} ${
    disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60' : ''
  } pr-10 ${className}`.trim();

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={selectClasses}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <svg
            className={`w-5 h-5 ${
              isFocused ? 'text-blue-600' : 'text-gray-400'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-medium mt-2">{error}</p>}
      {hint && !error && <p className="text-gray-500 text-xs mt-2">{hint}</p>}
    </div>
  );
};

// Checkbox Component
export const Checkbox = ({
  label = '',
  checked = false,
  onChange = null,
  disabled = false,
  error = '',
  className = '',
  ...props
}) => {
  return (
    <div className="flex items-start">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`.trim()}
        {...props}
      />
      {label && (
        <label className={`ml-3 text-sm font-medium text-gray-900 cursor-pointer ${
          disabled ? 'opacity-50' : ''
        }`}>
          {label}
        </label>
      )}
      {error && <p className="text-red-500 text-sm font-medium mt-1">{error}</p>}
    </div>
  );
};

// Radio Component
export const Radio = ({
  label = '',
  checked = false,
  onChange = null,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className="flex items-center">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={`w-5 h-5 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-200 cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`.trim()}
        {...props}
      />
      {label && (
        <label className={`ml-3 text-sm font-medium text-gray-900 cursor-pointer ${
          disabled ? 'opacity-50' : ''
        }`}>
          {label}
        </label>
      )}
    </div>
  );
};

// Form Group Component
export const FormGroup = ({ children, gap = 'md', className = '' }) => {
  const gapStyles = {
    sm: 'space-y-2',
    md: 'space-y-4',
    lg: 'space-y-6',
  };

  return (
    <div className={`${gapStyles[gap]} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default Input;
