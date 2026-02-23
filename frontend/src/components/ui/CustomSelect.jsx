'use client';

import React from 'react';
import { ChevronDown } from 'lucide-react';

const CustomSelect = ({
    label,
    icon: Icon,
    options = [],
    name,
    value,
    onChange,
    required = false,
    placeholder = "Select an option",
    error = false,
    className = ""
}) => {
    return (
        <div className={`space-y-0 ${className}`}>
            {label && (
                <label className={`block text-xs font-black uppercase tracking-widest mb-2.5 ml-1 ${error ? 'text-rose-500' : 'text-slate-900'}`}>
                    {label} {required && <span className="text-rose-500">*</span>}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors z-10 pointer-events-none ${error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#6366F1]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                <select
                    name={name}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={`
            w-full bg-slate-50 border rounded-2xl py-4 
            ${Icon ? 'pl-11' : 'px-5'} pr-12
            text-slate-900 appearance-none cursor-pointer font-bold
            ${error
                            ? 'border-rose-500/50 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/5 bg-rose-50/10 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                            : 'border-slate-200 focus:border-[#6366F1]/50 focus:ring-4 focus:ring-[#6366F1]/5'} 
            transition-all duration-300
          `}
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
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${error ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-[#6366F1]'}`}>
                    <ChevronDown size={18} />
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
