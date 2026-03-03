'use client';

import React from 'react';
import { Loader } from 'lucide-react';

const CustomButton = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon: Icon,
    className = ""
}) => {
    const baseStyles = "flex items-center justify-center gap-3 font-black uppercase transition-all duration-400 active:scale-95 disabled:opacity-50 disabled:pointer-events-none tracking-[0.2em] shadow-sm";

    const variants = {
        primary: "bg-[#6366F1] text-white shadow-xl shadow-indigo-600/20 hover:bg-[#4F46E5] hover:shadow-indigo-600/30 border border-transparent",
        secondary: "bg-white text-slate-900 hover:bg-slate-50 border border-slate-200 shadow-sm",
        outline: "bg-transparent border-2 border-slate-200 text-slate-600 hover:border-[#6366F1] hover:text-[#6366F1]",
        ghost: "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-900"
    };

    const sizes = {
        sm: "px-6 py-3 text-[10px]",
        md: "px-9 py-4.5 text-[11px]",
        lg: "px-14 py-6 text-xs tracking-[0.3em]"
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} rounded-[1.25rem] ${className}`}
        >
            {loading ? (
                <Loader className="animate-spin" size={20} />
            ) : (
                <>
                    {Icon && <Icon size={Icon.size || 18} strokeWidth={3} />}
                    {children}
                </>
            )}
        </button>
    );
};

export default CustomButton;
