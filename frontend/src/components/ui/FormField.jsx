'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Reusable form-field wrapper providing consistent labelling, error styling,
 * ARIA attributes, and animated inline error messages.
 * Primarily used for textareas and other non-standard inputs.
 */
const FormField = React.forwardRef(({
    label,
    name,
    required = false,
    error = false,
    errorMessage,
    className = "",
    children,
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
            {children}
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

FormField.displayName = 'FormField';

export default FormField;
