'use client';

import React, { useState } from 'react';

// Radio Component
const Radio = ({
  name = '',
  value = '',
  label = '',
  checked = false,
  onChange = null,
  disabled = false,
  description = '',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={`flex items-start gap-3 ${className}`.trim()}>
      <div className="flex items-center pt-1">
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={`
            ${sizeClasses[size]} appearance-none rounded-full
            border-2 border-gray-300 bg-white cursor-pointer
            transition duration-300 checked:bg-blue-600 checked:border-blue-600
            focus:ring-2 focus:ring-blue-200 focus:outline-none
            disabled:opacity-50 disabled:cursor-not-allowed
            ${checked ? 'after:content-[""] after:absolute after:inset-0' : ''}
          `.trim()}
          style={{
            backgroundImage: checked
              ? 'radial-gradient(circle, white 35%, transparent 35%)'
              : 'none',
          }}
        />
      </div>

      {label && (
        <div className="flex-1">
          <label
            className={`
              ${labelSizeClasses[size]} font-medium text-gray-900
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `.trim()}
          >
            {label}
          </label>
          {description && (
            <p className="text-xs text-gray-600 mt-1">{description}</p>
          )}
        </div>
      )}
    </div>
  );
};

// Radio Group Component
export const RadioGroup = ({
  name = '',
  options = [],
  value = '',
  onChange = null,
  disabled = false,
  direction = 'vertical',
  size = 'md',
  className = '',
  label = '',
  error = '',
  hint = '',
}) => {
  const [selected, setSelected] = useState(value);

  const handleChange = (optionValue) => {
    setSelected(optionValue);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const isHorizontal = direction === 'horizontal';

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          {label}
        </label>
      )}

      <div
        className={`
          ${isHorizontal ? 'flex gap-6' : 'space-y-4'}
        `.trim()}
      >
        {options.map((option) => (
          <Radio
            key={option.value}
            name={name}
            value={option.value}
            label={option.label}
            checked={selected === option.value}
            onChange={() => handleChange(option.value)}
            disabled={disabled || option.disabled}
            description={option.description}
            size={size}
          />
        ))}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {hint && <p className="text-xs text-gray-600 mt-2">{hint}</p>}
    </div>
  );
};

// Radio Card Component (for better visual representation)
export const RadioCard = ({
  options = [],
  value = '',
  onChange = null,
  columns = 1,
  className = '',
}) => {
  const [selected, setSelected] = useState(value);

  const handleChange = (optionValue) => {
    setSelected(optionValue);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={`grid ${gridColsClass[columns]} gap-4 ${className}`.trim()}>
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            relative flex items-center p-4 rounded-lg border-2
            cursor-pointer transition duration-300
            ${
              selected === option.value
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }
          `.trim()}
        >
          <input
            type="radio"
            value={option.value}
            checked={selected === option.value}
            onChange={() => handleChange(option.value)}
            className="sr-only"
          />
          <span className="flex items-center justify-center">
            <span
              className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center
                transition duration-300
                ${
                  selected === option.value
                    ? 'border-blue-600 bg-blue-600'
                    : 'border-gray-300 bg-white'
                }
              `.trim()}
            >
              {selected === option.value && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </span>
          </span>
          <span className="ml-3">
            <span className="block text-sm font-medium text-gray-900">
              {option.label}
            </span>
            {option.description && (
              <span className="block text-xs text-gray-600 mt-1">
                {option.description}
              </span>
            )}
            {option.badge && (
              <span className="inline-block mt-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {option.badge}
              </span>
            )}
          </span>
        </label>
      ))}
    </div>
  );
};

// Radio Button Group (button-style radio)
export const RadioButtonGroup = ({
  options = [],
  value = '',
  onChange = null,
  size = 'md',
  className = '',
}) => {
  const [selected, setSelected] = useState(value);

  const handleChange = (optionValue) => {
    setSelected(optionValue);
    if (onChange) {
      onChange(optionValue);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <div className={`flex gap-2 ${className}`.trim()}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleChange(option.value)}
          className={`
            ${sizeClasses[size]} font-medium rounded-lg
            border-2 transition duration-300
            ${
              selected === option.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-900 border-gray-300 hover:border-gray-400'
            }
          `.trim()}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default Radio;
