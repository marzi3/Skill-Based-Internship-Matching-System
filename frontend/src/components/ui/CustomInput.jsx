'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Validated input component compatible with react-hook-form's register().
 * Supports icon prefix, inline error messages, ARIA accessibility, and Framer Motion error animation.
 * @param {object} props
 * @param {string} [props.label] - Label text
 * @param {React.ElementType} [props.icon] - Lucide icon component
 * @param {string} [props.type] - Input type (text, email, password, number, date, etc.)
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.name] - Input name
 * @param {string} [props.value] - Controlled value (legacy support)
 * @param {Function} [props.onChange] - Legacy onChange handler
 * @param {boolean} [props.required] - Required indicator
 * @param {string|number} [props.min] - Min attribute
 * @param {string|number} [props.max] - Max attribute
 * @param {string|number} [props.step] - Step attribute
 * @param {boolean} [props.error] - Boolean error state (legacy compat)
 * @param {string} [props.errorMessage] - Inline error text from react-hook-form
 * @param {string} [props.className] - Container class override
 */
const CustomInput = React.forwardRef(({
    label,
    icon: Icon,
    type = 'text',
    placeholder,
    name,
    value,
    onChange,
    onBlur,
    required = false,
    min,
    max,
    step,
    error = false,
    errorMessage,
    className = "",
    ...rest
}, ref) => {
    const hasError = error || !!errorMessage;
    const errorId = name ? `${name}-error` : undefined;

    return (
        <div className={`space-y-0 ${className}`}>
            {label && (
                <label
                    htmlFor={name}
                    className={`block text-xs font-black uppercase tracking-widest mb-2.5 ml-1 ${hasError ? 'text-rose-500' : 'text-slate-900'}`}
                >
                    {label} {required && <span className="text-rose-500 ml-1 font-bold text-sm">*</span>}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${hasError ? 'text-rose-400' : 'text-slate-500 group-focus-within:text-[#6366F1]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    id={name}
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    required={false}
                    min={min}
                    max={max}
                    step={step}
                    aria-invalid={hasError ? 'true' : undefined}
                    aria-describedby={hasError && errorId ? errorId : undefined}
                    className={`
                        w-full bg-slate-50 border rounded-2xl py-4
                        ${Icon ? 'pl-11' : 'px-5'} pr-5
                        text-slate-900 placeholder:text-slate-500 font-bold
                        ${hasError
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/50 bg-rose-50/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                            : 'border-slate-200 focus:border-[#6366F1]/50 focus:ring-4 focus:ring-[#6366F1]/5'}
                        transition-all duration-300 outline-none
                    `}
                    {...rest}
                />
            </div>
            <AnimatePresence mode="wait">
                {hasError && errorMessage && (
                    <motion.p
                        id={errorId}
                        role="alert"
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.2 }}
                        className="text-rose-500 text-xs font-bold mt-1.5 ml-1"
                    >
                        {errorMessage}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
});

CustomInput.displayName = 'CustomInput';

export default CustomInput;
