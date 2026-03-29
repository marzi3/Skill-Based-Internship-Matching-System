'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Validated select component compatible with react-hook-form's register().
 * Supports icon prefix, inline error messages, ARIA accessibility, and Framer Motion error animation.
 */
const CustomSelect = React.forwardRef(({
    label,
    icon: Icon,
    options = [],
    name,
    value,
    onChange,
    onBlur,
    required = false,
    placeholder = "Select an option",
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
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${hasError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#6366F1]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <select
                    ref={ref}
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onBlur={onBlur}
                    required={false}
                    aria-invalid={hasError ? 'true' : undefined}
                    aria-describedby={hasError && errorId ? errorId : undefined}
                    className={`
                        w-full bg-slate-50 border rounded-2xl py-4
                        ${Icon ? 'pl-11' : 'px-5'} pr-12
                        text-slate-900 appearance-none cursor-pointer font-bold
                        ${hasError
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/50 bg-rose-50/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                            : 'border-slate-200 focus:border-[#6366F1]/50 focus:ring-4 focus:ring-[#6366F1]/5'}
                        transition-all duration-300 outline-none
                    `}
                    {...rest}
                >
                    <option value="" disabled className="bg-white text-slate-400">{placeholder}</option>
                    {options.map((opt) => (
                        <option
                            key={typeof opt === 'string' ? opt : opt.value}
                            value={typeof opt === 'string' ? opt : opt.value}
                            className="bg-white text-slate-900"
                        >
                            {typeof opt === 'string' ? opt : opt.label}
                        </option>
                    ))}
                </select>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${hasError ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#6366F1]'}`}>
                    <ChevronDown size={18} />
                </div>
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

CustomSelect.displayName = 'CustomSelect';

export default CustomSelect;
