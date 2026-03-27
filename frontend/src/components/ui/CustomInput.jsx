'use client';

import React from 'react';

const CustomInput = ({
    label,
    icon: Icon,
    type = 'text',
    placeholder,
    name,
    value,
    onChange,
    required = false,
    min,
    error = false,
    className = ""
}) => {
    return (
        <div className={`space-y-0 ${className}`}>
            {label && (
                <label className={`block text-xs font-black uppercase tracking-widest mb-2.5 ml-1 ${error ? 'text-rose-500' : 'text-slate-900'}`}>
                    {label} {required && <span className="text-rose-500 ml-1 font-bold text-sm">*</span>}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 ${error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#6366F1]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    min={min}
                    className={`
            w-full bg-slate-50 border rounded-2xl py-4 
            ${Icon ? 'pl-11' : 'px-5'} pr-5
            text-slate-900 placeholder:text-slate-400 font-bold
            ${error
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 bg-rose-50/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                            : 'border-slate-200 focus:border-[#6366F1]/50 focus:ring-4 focus:ring-[#6366F1]/5'} 
            transition-all duration-300
          `}
                />
            </div>
        </div>
    );
};

export default CustomInput;
