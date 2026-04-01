'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentEducationSchema } from '@/lib/validationSchemas';
import { GraduationCap, BookOpen, Calendar, MapPin, X, PlusCircle, Trash, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '@/components/ui/CustomInput';
import CustomSelect from '@/components/ui/CustomSelect';

/**
 * Student Education Entry Form
 * @param {Object} props
 * @param {Object} props.entry - Entry to edit (if any)
 * @param {Function} props.onSubmit - Submission handler
 * @param {Function} props.onCancel - Cancel handler
 * @param {boolean} props.isLoading - Loading state
 */
const EducationForm = ({ entry, onSubmit, onCancel, isLoading }) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentEducationSchema),
    mode: 'onBlur',
    defaultValues: {
      institution: entry?.institution || '',
      degree: entry?.degree || '',
      field: entry?.field || '',
      degreeLevel: entry?.degreeLevel || 'BACHELOR',
      startDate: entry?.startDate ? new Date(entry.startDate).toISOString().split('T')[0] : '',
      endDate: entry?.endDate ? new Date(entry.endDate).toISOString().split('T')[0] : '',
      isCurrentlyStudying: entry?.isCurrentlyStudying || false,
    },
  });

  const isCurrentlyStudying = watch('isCurrentlyStudying');

  const degreeLevelOptions = [
    { value: 'HIGH_SCHOOL', label: 'High School' },
    { value: 'ASSOCIATE', label: 'Associate Degree' },
    { value: 'BACHELOR', label: 'Bachelor’s Degree' },
    { value: 'MASTER', label: 'Master’s Degree' },
    { value: 'DOCTORATE', label: 'Doctorate (Ph.D.)' },
    { value: 'CERTIFICATE', label: 'Professional Certificate' },
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-gray-100 p-10 shadow-sm relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 -mr-12 -mt-12 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-100 transition-colors" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm">
            <GraduationCap size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900 tracking-tight">{entry ? 'Update Academic Credential' : 'Add Academic Qualification'}</h3>
            <p className="text-sm font-bold text-gray-500">Document your educational background for verification.</p>
          </div>
        </div>
        <button
          onClick={onCancel}
          type="button"
          className="text-gray-500 hover:text-rose-500 transition-colors p-2"
        >
          <X size={24} strokeWidth={3} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <CustomInput
            label="Institution Name"
            icon={BookOpen}
            required
            {...register('institution')}
            error={!!errors.institution}
            errorMessage={errors.institution?.message}
            placeholder="e.g. Stanford University"
          />

          <CustomSelect
            label="Degree Level"
            icon={GraduationCap}
            options={degreeLevelOptions}
            required
            {...register('degreeLevel')}
            error={!!errors.degreeLevel}
            errorMessage={errors.degreeLevel?.message}
          />

          <CustomInput
            label="Degree Earned"
            icon={GraduationCap}
            required
            {...register('degree')}
            error={!!errors.degree}
            errorMessage={errors.degree?.message}
            placeholder="e.g. BS Computer Science"
          />

          <CustomInput
            label="Major / Field of Study"
            icon={BookOpen}
            required
            {...register('field')}
            error={!!errors.field}
            errorMessage={errors.field?.message}
            placeholder="e.g. Artificial Intelligence"
          />

          <CustomInput
            label="Start Date"
            icon={Calendar}
            type="date"
            required
            {...register('startDate')}
            error={!!errors.startDate}
            errorMessage={errors.startDate?.message}
          />

          <div className="space-y-4">
            <CustomInput
              label="End Date (Expected)"
              icon={Calendar}
              type="date"
              disabled={isCurrentlyStudying}
              {...register('endDate')}
              error={!!errors.endDate}
              errorMessage={errors.endDate?.message}
            />
            <label className="flex items-center gap-3 cursor-pointer group px-1">
              <input
                type="checkbox"
                {...register('isCurrentlyStudying')}
                className="w-5 h-5 rounded-lg text-indigo-600 border-gray-200 focus:ring-indigo-500 transition-all cursor-pointer"
              />
              <span className="text-xs font-black uppercase tracking-widest text-gray-500 group-hover:text-gray-900 transition-colors">I am currently studying here</span>
            </label>
          </div>
        </div>

        <div className="pt-6 flex items-center justify-end gap-4">
          <button
            onClick={onCancel}
            type="button"
            className="px-8 py-3 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl shadow-gray-200 active:scale-95"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (entry ? <Save size={18} /> : <PlusCircle size={18} />)}
            {entry ? 'Update Credential' : 'Deploy Qualification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EducationForm;
