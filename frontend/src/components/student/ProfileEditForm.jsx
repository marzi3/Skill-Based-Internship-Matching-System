'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { studentProfileSchema } from '@/lib/validationSchemas';
import { User, Phone, MapPin, Target, GraduationCap, Clock, Save, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomInput from '@/components/ui/CustomInput';
import CustomSelect from '@/components/ui/CustomSelect';

/**
 * Student Personal Information Edit Form
 * @param {Object} props
 * @param {Object} props.initialData - Initial profile data
 * @param {Function} props.onSubmit - Submission handler
 * @param {boolean} props.isLoading - Loading state
 */
const ProfileEditForm = ({ initialData, onSubmit, isLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(studentProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      fullName: initialData?.personalInfo?.fullName || '',
      designation: initialData?.personalInfo?.designation || '',
      phone: initialData?.personalInfo?.phone || '',
      location: initialData?.personalInfo?.location || '',
      preferredLocation: initialData?.personalInfo?.preferredLocation || '',
      gpa: initialData?.personalInfo?.gpa || '',
      durationPreference: initialData?.personalInfo?.durationPreference || '',
      gender: initialData?.personalInfo?.gender || '',
    },
  });

  const durationOptions = [
    { value: '1-3 months', label: '1 - 3 Months' },
    { value: '3-6 months', label: '3 - 6 Months' },
    { value: '6-12 months', label: '6 - 12 Months' },
    { value: '12+ months', label: '12+ Months' },
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Full Name */}
        <CustomInput
          label="Full Name"
          icon={User}
          required
          {...register('fullName')}
          error={!!errors.fullName}
          errorMessage={errors.fullName?.message}
          placeholder="e.g. Alex Johnson"
        />

        {/* Designation */}
        <CustomInput
          label="Current Designation"
          icon={Target}
          {...register('designation')}
          error={!!errors.designation}
          errorMessage={errors.designation?.message}
          placeholder="e.g. Computer Science Student"
        />

        {/* Phone (E.164) */}
        <CustomInput
          label="Phone Number"
          icon={Phone}
          {...register('phone')}
          error={!!errors.phone}
          errorMessage={errors.phone?.message}
          placeholder="+1234567890"
        />

        {/* Location */}
        <CustomInput
          label="Current Location"
          icon={MapPin}
          {...register('location')}
          error={!!errors.location}
          errorMessage={errors.location?.message}
          placeholder="e.g. New York, USA"
        />

        {/* Preferred Location */}
        <CustomInput
          label="Preferred Work Location"
          icon={MapPin}
          {...register('preferredLocation')}
          error={!!errors.preferredLocation}
          errorMessage={errors.preferredLocation?.message}
          placeholder="e.g. Remote, Sri Lanka"
        />

        {/* GPA */}
        <CustomInput
          label="Current GPA (Scale 0.0 - 4.0)"
          icon={GraduationCap}
          type="number"
          step="0.01"
          {...register('gpa')}
          error={!!errors.gpa}
          errorMessage={errors.gpa?.message}
          placeholder="3.85"
        />

        {/* Duration Preference */}
        <CustomSelect
          label="Internship Duration Preference"
          icon={Clock}
          options={durationOptions}
          {...register('durationPreference')}
          error={!!errors.durationPreference}
          errorMessage={errors.durationPreference?.message}
        />

        {/* Gender */}
        <CustomSelect
          label="Gender Identity"
          icon={User}
          options={genderOptions}
          {...register('gender')}
          error={!!errors.gender}
          errorMessage={errors.gender?.message}
        />
      </div>

      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Saving Profile...
            </>
          ) : (
            <>
              <Save size={20} />
              Update Personal Info
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ProfileEditForm;
