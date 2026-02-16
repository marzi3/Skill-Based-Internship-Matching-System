'use client';

import React, { useState, useCallback } from 'react';

// Form Component
const Form = ({
  fields = [],
  initialValues = {},
  onSubmit = null,
  onCancel = null,
  submitLabel = 'Submit',
  cancelLabel = 'Cancel',
  layout = 'vertical', // 'vertical', 'horizontal', 'inline'
  columns = 1,
  className = '',
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const validateField = (fieldName, value) => {
    const field = fields.find((f) => f.name === fieldName);
    if (!field) return null;

    if (field.required && !value) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email';
      }
    }

    if (field.minLength && value.length < field.minLength) {
      return `Must be at least ${field.minLength} characters`;
    }

    if (field.maxLength && value.length > field.maxLength) {
      return `Must not exceed ${field.maxLength} characters`;
    }

    if (field.pattern && !field.pattern.test(value)) {
      return field.patternMessage || 'Invalid format';
    }

    if (field.validate) {
      const customError = field.validate(value, values);
      if (customError) return customError;
    }

    return null;
  };

  const validateForm = () => {
    const newErrors = {};
    fields.forEach((field) => {
      const error = validateField(field.name, values[field.name] || '');
      if (error) {
        newErrors[field.name] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(values);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-4',
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={`grid ${gridColsClass[columns]} gap-4 md:gap-6`}>
        {fields.map((field) => {
          const fieldValue = values[field.name] || '';
          const fieldError = errors[field.name];
          const isFieldTouched = touched[field.name];
          const showError = fieldError && isFieldTouched;

          if (field.type === 'hidden') {
            return (
              <input
                key={field.name}
                type="hidden"
                name={field.name}
                value={fieldValue}
              />
            );
          }

          if (field.type === 'section') {
            return (
              <div key={field.name} className="col-span-full">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {field.label}
                </h3>
              </div>
            );
          }

          return (
            <div key={field.name} className={field.fullWidth ? 'col-span-full' : ''}>
              {field.type === 'textarea' ? (
                <div>
                  {field.label && (
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>
                  )}
                  <textarea
                    name={field.name}
                    value={fieldValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    rows={field.rows || 4}
                    disabled={field.disabled}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border-2 font-medium
                      transition duration-300 focus:outline-none
                      ${
                        showError
                          ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
                      }
                      ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `.trim()}
                  />
                  {showError && (
                    <p className="text-xs text-red-600 mt-1">{fieldError}</p>
                  )}
                  {field.hint && !showError && (
                    <p className="text-xs text-gray-600 mt-1">{field.hint}</p>
                  )}
                </div>
              ) : field.type === 'select' ? (
                <div>
                  {field.label && (
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>
                  )}
                  <select
                    name={field.name}
                    value={fieldValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={field.disabled}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border-2 font-medium
                      transition duration-300 focus:outline-none
                      ${
                        showError
                          ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
                      }
                      ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `.trim()}
                  >
                    <option value="">
                      {field.placeholder || `Select ${field.label}`}
                    </option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {showError && (
                    <p className="text-xs text-red-600 mt-1">{fieldError}</p>
                  )}
                </div>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name={field.name}
                    checked={fieldValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    disabled={field.disabled}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 cursor-pointer"
                  />
                  {field.label && (
                    <label className="text-sm font-medium text-gray-900 cursor-pointer">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>
                  )}
                </div>
              ) : field.type === 'radio' ? (
                <div>
                  {field.label && (
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>
                  )}
                  <div className="space-y-2">
                    {field.options?.map((option) => (
                      <div key={option.value} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={field.name}
                          value={option.value}
                          checked={fieldValue === option.value}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          disabled={field.disabled}
                          className="w-4 h-4 text-blue-600 border-gray-300 cursor-pointer"
                        />
                        <label className="text-sm text-gray-900 cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                  {showError && (
                    <p className="text-xs text-red-600 mt-2">{fieldError}</p>
                  )}
                </div>
              ) : (
                <div>
                  {field.label && (
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>
                  )}
                  <input
                    type={field.type || 'text'}
                    name={field.name}
                    value={fieldValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={field.placeholder}
                    disabled={field.disabled}
                    className={`
                      w-full px-4 py-2.5 rounded-lg border-2 font-medium
                      transition duration-300 focus:outline-none
                      ${
                        showError
                          ? 'border-red-600 focus:ring-2 focus:ring-red-200'
                          : 'border-gray-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-200'
                      }
                      ${field.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `.trim()}
                  />
                  {showError && (
                    <p className="text-xs text-red-600 mt-1">{fieldError}</p>
                  )}
                  {field.hint && !showError && (
                    <p className="text-xs text-gray-600 mt-1">{field.hint}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8 col-span-full">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition duration-300
            ${
              isSubmitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }
          `.trim()}
        >
          {isSubmitting ? 'Submitting...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={() => {
              handleReset();
              onCancel();
            }}
            className="px-6 py-2.5 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-900 transition duration-300"
          >
            {cancelLabel}
          </button>
        )}
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-2.5 rounded-lg font-medium bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-300 transition duration-300"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

// useForm Hook for advanced form handling
export const useForm = (initialValues = {}, onSubmit = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setFieldValue = useCallback((name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  }, []);

  const setFieldError = useCallback((name, error) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  }, []);

  const setFieldTouched = useCallback((name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      try {
        if (onSubmit) {
          await onSubmit(values);
        }
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    handleSubmit,
    resetForm,
  };
};

// Form Builder Component
export const FormBuilder = ({ formConfig = {}, onSubmit = null, className = '' }) => {
  return (
    <Form
      fields={formConfig.fields || []}
      initialValues={formConfig.initialValues}
      onSubmit={onSubmit}
      onCancel={formConfig.onCancel}
      submitLabel={formConfig.submitLabel}
      cancelLabel={formConfig.cancelLabel}
      layout={formConfig.layout}
      columns={formConfig.columns}
      className={className}
    />
  );
};

export default Form;
