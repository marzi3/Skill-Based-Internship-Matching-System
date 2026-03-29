'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentSkillSchema } from '@/lib/validationSchemas';
import { Star, Code, Trash2, Plus, X, Loader2, Sparkles, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Student Skill Management Interface
 * @param {Object} props
 * @param {Array} props.skills - Current skills
 * @param {Function} props.onAdd - Add skill handler
 * @param {Function} props.onRemove - Remove skill handler
 * @param {boolean} props.isLoading - Loading state
 */
const SkillManager = ({ skills = [], onAdd, onRemove, isLoading }) => {
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentSkillSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      proficiency: 'INTERMEDIATE',
    },
  });

  const proficiencyLevels = [
    { value: 'BEGINNER', label: 'Beginner', color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-100' },
    { value: 'INTERMEDIATE', label: 'Intermediate', color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { value: 'ADVANCED', label: 'Advanced', color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { value: 'EXPERT', label: 'Expert', color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
  ];

  const handleSkillSubmit = (data) => {
    onAdd(data);
    reset();
    setIsAdding(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
            <Sparkles className="text-indigo-500" size={24} /> Skill DNA Sequence
          </h3>
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">Map your technical architecture for the matching engine.</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-3 bg-white border border-gray-100 px-6 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest text-[#6366F1] shadow-xl shadow-indigo-600/5 hover:border-[#6366F1] hover:scale-105 transition-all outline-none"
          >
            <Plus size={16} strokeWidth={3} /> Infuse Skill
          </button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSubmit(handleSkillSubmit)} className="bg-indigo-50/30 border-2 border-dashed border-indigo-100 rounded-3xl p-8 mb-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 ml-1">Universal Skill Name</label>
                  <div className="relative group">
                    <Code className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input
                      {...register('name')}
                      placeholder="e.g. Next.js Architecture"
                      className={`w-full bg-white border rounded-2xl py-4 pl-12 pr-6 text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 placeholder:text-gray-300 transition-all ${errors.name ? 'border-rose-500 focus:border-rose-500' : 'border-indigo-100 focus:border-indigo-500'}`}
                    />
                  </div>
                  {errors.name && <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1 mt-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-900 ml-1">Proficiency Calibration</label>
                  <div className="grid grid-cols-2 gap-3">
                    {proficiencyLevels.map((lvl) => (
                      <label 
                        key={lvl.value} 
                        className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] ${register('proficiency').value === lvl.value ? `${lvl.bg} ${lvl.border} shadow-sm` : 'bg-white border-transparent'}`}
                      >
                        <input
                          type="radio"
                          value={lvl.value}
                          {...register('proficiency')}
                          className="hidden"
                        />
                        <div className={`w-3 h-3 rounded-full ${lvl.bg} border-2 ${lvl.border} transition-all`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${lvl.color}`}>{lvl.label}</span>
                      </label>
                    ))}
                  </div>
                  {errors.proficiency && <p className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1 mt-1">{errors.proficiency.message}</p>}
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-gray-900 transition-colors"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={16} /> : <UserCheck size={16} fill="currentColor" />}
                  Deploy Skill
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill, index) => {
          const name = typeof skill === 'string' ? skill : skill.name;
          const profStr = typeof skill === 'string' ? 'INTERMEDIATE' : skill.proficiency || 'INTERMEDIATE';
          const prof = proficiencyLevels.find(l => l.value === profStr) || proficiencyLevels[1];

          return (
            <motion.div
              layout
              key={name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm group hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-600/5 transition-all relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl flex items-center justify-center transition-colors">
                  <Star size={18} fill="currentColor" />
                </div>
                <button
                  onClick={() => onRemove(name)}
                  className="text-gray-300 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <h4 className="text-lg font-black text-gray-900 tracking-tight line-clamp-1">{name}</h4>
              <div className={`mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${prof.bg} border ${prof.border}`}>
                <div className={`w-2 h-2 rounded-full ${prof.color} bg-current`} />
                <span className={`text-[9px] font-black uppercase tracking-widest ${prof.color}`}>{prof.label}</span>
              </div>
            </motion.div>
          );
        })}

        {skills.length === 0 && !isAdding && (
          <div className="col-span-full py-16 text-center bg-gray-50/50 rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto text-gray-200 mb-4 shadow-sm">
              <UserCheck size={32} />
            </div>
            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No skill sequence detected.</p>
            <p className="text-gray-300 text-[10px] font-bold mt-2">Initialize your profile by adding technical skills above.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillManager;
