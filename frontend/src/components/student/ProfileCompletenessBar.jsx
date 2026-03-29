'use client';

import { CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Student Profile Progress and Completeness Tracker
 * @param {Object} props
 * @param {Object} props.completion - { personal, education, skills, overall }
 */
const ProfileCompletenessBar = ({ completion = {} }) => {
  const { 
    personal = 0, 
    education = 0, 
    skills = 0, 
    overall = 0 
  } = completion;

  const isReadyForMatch = overall >= 80;

  const stats = [
    { label: 'Personal Architecture', value: personal, color: 'bg-emerald-500' },
    { label: 'Academic Credentials', value: education, color: 'bg-sky-500' },
    { label: 'Technical DNA', value: skills, color: 'bg-indigo-500' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm group relative overflow-hidden">
      {/* Decorative Background */}
      <div className={`absolute -right-16 -bottom-16 w-64 h-64 rounded-full blur-[100px] transition-colors duration-1000 ${isReadyForMatch ? 'bg-emerald-50' : 'bg-amber-50'}`} />

      <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
        {/* Overall Percentage Circle */}
        <div className="relative flex-shrink-0">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              className="text-gray-100"
            />
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              stroke="currentColor"
              strokeWidth="10"
              fill="transparent"
              strokeDasharray={364.4}
              initial={{ strokeDashoffset: 364.4 }}
              animate={{ strokeDashoffset: 364.4 * (1 - overall / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className={isReadyForMatch ? 'text-emerald-500' : 'text-indigo-500'}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-gray-900 tracking-tighter">{Math.round(overall)}%</span>
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Complete</span>
          </div>
        </div>

        {/* Breakdown Bars */}
        <div className="flex-1 space-y-6 w-full">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-black text-gray-900 tracking-tighter">Profile Connectivity</h4>
              <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">Strength across matching dimensions.</p>
            </div>
            {isReadyForMatch ? (
              <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                <ShieldCheck size={16} /> Matching Engine Fully Initialized
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                <AlertTriangle size={16} /> Insufficient Data For High-Confidence Matching
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{stat.label}</span>
                  <span className="text-[10px] font-black text-gray-700">{Math.round(stat.value)}%</span>
                </div>
                <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden border border-gray-100 flex shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.value}%` }}
                    transition={{ duration: 1, delay: i * 0.2 }}
                    className={`h-full ${stat.color} shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 pt-8 border-t border-gray-50 flex flex-wrap items-center gap-6 relative z-10">
        <div className="flex items-center gap-2">
          <Zap className="text-emerald-500" size={16} fill="currentColor" />
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Target Match Efficiency: <span className="text-gray-900">{overall > 0 ? (overall * 0.9).toFixed(1) : 0}%</span></p>
        </div>
        {!isReadyForMatch && overall > 0 && (
          <p className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100 uppercase tracking-widest animate-pulse">Tip: Add 3+ Expert Skills to bypass high-priority verification.</p>
        )}
      </div>
    </div>
  );
};

export default ProfileCompletenessBar;
