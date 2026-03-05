'use client';

import { motion } from 'framer-motion';

export default function MatchScore({ score = 0, size = 100, strokeWidth = 8, label = 'Match Score' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    // Ensure score is clamped between 0 and 100
    const normalizedScore = Math.max(0, Math.min(100, score));
    const offset = circumference - (normalizedScore / 100) * circumference;

    const getColorClass = (s) => {
        if (s >= 90) return 'text-emerald-500';
        if (s >= 70) return 'text-blue-500';
        if (s >= 50) return 'text-amber-500';
        return 'text-rose-500';
    };

    const getGlowClass = (s) => {
        if (s >= 90) return 'drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]';
        if (s >= 70) return 'drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]';
        if (s >= 50) return 'drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]';
        return 'drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]';
    };

    return (
        <div className="relative flex flex-col items-center justify-center p-2" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="transform -rotate-90 absolute">
                {/* Background Track */}
                <circle
                    className="text-gray-100"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />

                {/* Animated Progress Indicator */}
                <motion.circle
                    className={`${getColorClass(normalizedScore)} ${getGlowClass(normalizedScore)}`}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black tabular-nums tracking-tighter ${getColorClass(normalizedScore)}`}>
                    {Math.round(normalizedScore)}%
                </span>
                {label && <span className="text-[9px] uppercase font-bold tracking-widest text-gray-400 mt-0.5">{label}</span>}
            </div>
        </div>
    );
}
