'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { internshipStep1Schema, internshipStep2Schema, internshipStep3Schema } from '@/lib/validationSchemas';
import Link from 'next/link';
import axios from '@/services/apiClient';
import skillsData from '@/data/skills.json';
import degreesData from '@/data/degrees.json';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Zap,
  Code,
  X,
  Loader,
  AlertTriangle,
  Award,
  ChevronRight,
  ChevronLeft,
  Eye,
  GraduationCap,
  Layers,
  Banknote,
  Building,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

import CustomInput from '@/components/ui/CustomInput';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomButton from '@/components/ui/CustomButton';
import Stepper from '@/components/ui/Stepper';
import { useAuth } from '@/context/AuthContext';

/**
 * Unified Zod schema for editing.
 */
const fullInternshipSchema = z.object({
  // Step 1
  position: z.string().min(1, 'Position title is required').max(100, 'Position title cannot exceed 100 characters'),
  category: z.string().min(1, 'Domain category is required'),
  locationType: z.enum(['Remote', 'On-site', 'Hybrid', ''], { errorMap: () => ({ message: 'Work environment is required' }) }).refine(val => val !== '', { message: 'Work environment is required' }),
  location: z.string().min(1, 'Location is required'),
  duration: z.string().min(1, 'Duration is required'),
  numberOfOpenings: z.coerce.number({ invalid_type_error: 'Must be a number' }).int('Must be a whole number').min(1, 'At least 1 opening is required'),
  deadline: z.string().min(1, 'Expiry date is required'), // Allow past dates for editing in case it's already expired? Usually best to keep future-only or validate on change.
  // Step 2
  experienceLevel: z.string().min(1, 'Experience level is required'),
  // Step 3
  description: z.string().min(20, 'Description must be at least 20 characters').or(z.literal('')),
  // Optional fields
  educationRequirements: z.string().optional(),
  minimumGPA: z.string().optional(),
  stipendAmount: z.string().optional(),
});

const STEP_1_FIELDS = ['position', 'category', 'locationType', 'location', 'duration', 'numberOfOpenings', 'deadline'];
const STEP_2_FIELDS = ['experienceLevel'];
const STEP_3_FIELDS = ['description'];

const EditInternshipPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { user } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ─── useForm with Zod ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    reset,
    setError: setFieldError,
    clearErrors,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fullInternshipSchema),
    mode: 'onBlur',
    defaultValues: {
      position: '',
      category: '',
      locationType: '',
      location: '',
      duration: '',
      numberOfOpenings: '',
      deadline: '',
      description: '',
      experienceLevel: '',
      educationRequirements: '',
      minimumGPA: '0.0',
      stipendAmount: '',
    },
  });

  const formValues = watch();

  // ─── Array state ──────────────────
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [requiredDegreeField, setRequiredDegreeField] = useState([]);
  const [perks, setPerks] = useState([]);
  const [prefersExperienced, setPrefersExperienced] = useState(false);
  const [isGpaMandatory, setIsGpaMandatory] = useState(false);

  const [skillInput, setSkillInput] = useState('');
  const [degreeInput, setDegreeInput] = useState('');
  const [perkInput, setPerkInput] = useState('');
  
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [degreeSuggestions, setDegreeSuggestions] = useState([]);

  const steps = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Requirements' },
    { id: 3, title: 'Details' },
  ];

  const categories = [
    'Web Development', 'Mobile App Development', 'UI/UX Design',
    'Data Science', 'Backend Development', 'Frontend Development',
    'Cloud & DevOps', 'Machine Learning', 'Cloud Architecture', 'Database Design'
  ];

  const locationTypes = ['Remote', 'On-site', 'Hybrid'];
  const experienceLevels = ['Entry Level', 'Intermediate', 'Student', 'Graduate'];
  const durationOptions = [
    { value: '1', label: '1 Month' },
    { value: '2', label: '2 Months' },
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
  ];

  useEffect(() => {
    const fetchInternship = async () => {
      try {
        setFetching(true);
        const response = await axios.get(`/internships/${id}`);
        const data = response.data.data;

        reset({
          position: data.positionTitle || '',
          category: data.domain || '',
          locationType: data.workEnvironment || '',
          location: data.location || '',
          duration: data.duration || '',
          deadline: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : '',
          description: data.description || '',
          experienceLevel: data.experienceLevel || '',
          educationRequirements: data.educationRequirements || '',
          minimumGPA: data.minimumGPA?.toString() || '0.0',
          stipendAmount: data.stipend?.amount?.toString() || '',
        });

        setRequiredSkills(data.requiredSkills || []);
        setRequiredDegreeField(data.requiredDegreeField || []);
        setPerks(data.perks || []);
        setPrefersExperienced(data.prefersExperienced || false);
        setIsGpaMandatory(!!data.minimumGPA && parseFloat(data.minimumGPA) > 0);
        
        setFetching(false);
      } catch (err) {
        console.error('Failed to fetch internship details:', err);
        setError('Failed to load internship content. Access denied or link expired.');
        setFetching(false);
      }
    };

    if (id) fetchInternship();
  }, [id, reset]);

  // ─── Tag Handlers ──────────────────────────────────────────────────────────
  const handleAddSkill = (e, skillNameOverride) => {
    if (e) e.preventDefault();
    const newSkill = (skillNameOverride || skillInput).trim();
    if (newSkill && !requiredSkills.some(s => (typeof s === 'string' ? s : s.name) === newSkill)) {
      setRequiredSkills(prev => [...prev, { name: newSkill, mandatory: true, prefersSenior: false }]);
      setSkillInput('');
      setSkillSuggestions([]);
      clearErrors('requiredSkills');
    }
  };

  const handleSkillInputChange = (value) => {
    setSkillInput(value);
    const filtered = skillsData.filter(s => 
      s.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    setSkillSuggestions(value ? filtered : []);
  };

  const handleRemoveSkill = (skillName) => {
    setRequiredSkills(prev => prev.filter(s => (typeof s === 'string' ? s : s.name) !== skillName));
  };

  const handleAddDegree = (e, degreeNameOverride) => {
    if (e) e.preventDefault();
    const newDegree = (degreeNameOverride || degreeInput).trim();
    if (newDegree && !requiredDegreeField.includes(newDegree)) {
      setRequiredDegreeField(prev => [...prev, newDegree]);
      setDegreeInput('');
      setDegreeSuggestions([]);
      clearErrors('requiredDegreeField');
    }
  };

  const handleDegreeInputChange = (value) => {
    setDegreeInput(value);
    if (errors.requiredDegreeField) clearErrors('requiredDegreeField');
    const filtered = degreesData.filter(d => 
      d.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    setDegreeSuggestions(value ? filtered : []);
  };

  const handleRemoveDegree = (degreeToRemove) => {
    setRequiredDegreeField(prev => prev.filter(d => d !== degreeToRemove));
  };

  const handleAddPerk = (e) => {
    if (e) e.preventDefault();
    const newPerk = perkInput.trim();
    if (newPerk && !perks.includes(newPerk)) {
      setPerks(prev => [...prev, newPerk]);
      setPerkInput('');
    }
  };

  const handleRemovePerk = (perkToRemove) => {
    setPerks(prev => prev.filter(p => p !== perkToRemove));
  };

  const handleGpaChange = (e) => {
    let val = parseFloat(e.target.value);
    if (val > 4.0) e.target.value = '4.0';
    if (val < 0) e.target.value = '0';
    setValue('minimumGPA', e.target.value);
  };

  const handleStipendChange = (e) => {
    let val = parseInt(e.target.value);
    if (val < 0) e.target.value = '0';
    setValue('stipendAmount', e.target.value);
  };

  const nextStep = async () => {
    let valid = false;

    if (currentStep === 1) {
      valid = await trigger(STEP_1_FIELDS);
    } else if (currentStep === 2) {
      valid = await trigger(STEP_2_FIELDS);
      let arrayErrors = false;
      if (requiredSkills.length === 0) {
        setFieldError('requiredSkills', { type: 'manual', message: 'At least one required skill is needed' });
        arrayErrors = true;
      }
      if (requiredDegreeField.length === 0) {
        setFieldError('requiredDegreeField', { type: 'manual', message: 'At least one degree field is required' });
        arrayErrors = true;
      }
      if (arrayErrors) valid = false;
    }

    if (valid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError(null);
    } else {
      setError('Highlighted fields require adjustment before next stage.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const onSubmit = async (data) => {
    if (!data.description || data.description.length < 20) {
      setFieldError('description', { type: 'manual', message: 'Description must be at least 20 characters' });
      setError('Final clearance failed: INTERNSHIP DESCRIPTION must be at least 20 characters.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        positionTitle: data.position,
        domain: data.category,
        workEnvironment: data.locationType,
        location: data.location,
        duration: data.duration,
        expiryDate: data.deadline,
        requiredSkills: requiredSkills,
        description: data.description,
        numberOfOpenings: parseInt(data.numberOfOpenings) || 1,
        experienceLevel: data.experienceLevel,
        prefersExperienced: prefersExperienced,
        educationRequirements: data.educationRequirements,
        requiredDegreeField: requiredDegreeField,
        minimumGPA: data.minimumGPA ? parseFloat(data.minimumGPA) : 0,
        stipend: {
          amount: parseInt(data.stipendAmount) || 0,
          currency: 'RS'
        },
        perks: perks,
        status: 'Hiring'
      };

      const response = await axios.put(`/internships/${id}`, payload);

      if (response.data.success) {
        setSuccessMessage('Internship protocol successfully updated! Synchronizing Dashboard...');
        setTimeout(() => router.push('/employer/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Transmission failed. Verify server link.');
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Accessing Database Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden">
      <div className="w-full max-w-7xl h-full flex flex-col">
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <Link href="/employer/internships" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black group">
            <div className="p-2 rounded-xl group-hover:bg-white transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] ml-2 font-black">Back to Postings</span>
          </Link>
          <Stepper currentStep={currentStep} steps={steps} />
          <div className="w-32" />
        </div>

        {/* Outer Container */}
        <div className="flex-1 flex overflow-hidden rounded-[3rem] shadow-2xl border border-slate-100 bg-white relative">
          
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center text-center p-12"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="max-w-md space-y-6"
                >
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
                    <CheckCircle2 size={48} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Update Deployed</h3>
                  <p className="text-slate-500 font-bold leading-relaxed">{successMessage}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Column */}
          <div className="w-7/12 flex flex-col bg-white overflow-hidden relative border-r border-slate-50">
            <div className="flex-1 p-16 overflow-y-auto custom-scrollbar relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-12"
                >
                  <header>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                      Edit <span className="text-[#6366F1] font-medium tracking-normal italic text-4xl">Posting</span>
                    </h2>
                    <p className="text-slate-500 mt-5 text-[10px] font-black uppercase tracking-[0.4em]">Modification Protocol Active</p>
                  </header>

                  <div className="grid grid-cols-1 gap-12">
                    {currentStep === 1 && (
                      <div className="space-y-10">
                        <CustomInput
                          label="Position Title"
                          icon={Briefcase}
                          required
                          {...register('position')}
                          error={!!errors.position}
                          errorMessage={errors.position?.message}
                        />
                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Domain"
                            icon={Code}
                            options={categories}
                            required
                            {...register('category')}
                            error={!!errors.category}
                            errorMessage={errors.category?.message}
                          />
                          <CustomSelect
                            label="Environment"
                            icon={MapPin}
                            options={locationTypes}
                            required
                            {...register('locationType')}
                            error={!!errors.locationType}
                            errorMessage={errors.locationType?.message}
                          />
                        </div>
                        <CustomInput
                          label="Specific Location"
                          icon={Building}
                          placeholder={formValues.locationType === 'Remote' ? "e.g. US Only, Worldwide" : "e.g. San Francisco, CA"}
                          required
                          {...register('location')}
                          error={!!errors.location}
                          errorMessage={errors.location?.message}
                        />
                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Duration"
                            icon={Clock}
                            options={durationOptions}
                            required
                            {...register('duration')}
                            error={!!errors.duration}
                            errorMessage={errors.duration?.message}
                          />
                          <CustomInput
                            label="Openings"
                            icon={Users}
                            type="number"
                            required
                            {...register('numberOfOpenings')}
                            error={!!errors.numberOfOpenings}
                            errorMessage={errors.numberOfOpenings?.message}
                          />
                        </div>
                        <CustomInput
                          label="Expiry Date"
                          icon={Calendar}
                          type="date"
                          required
                          {...register('deadline')}
                          error={!!errors.deadline}
                          errorMessage={errors.deadline?.message}
                        />
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest text-slate-900 mb-2.5 ml-1 ${errors.requiredSkills ? 'text-rose-500' : ''}`}>
                            Skills Assessment <span className="text-rose-500 ml-1 font-bold text-sm">*</span>
                          </label>
                          <div className="flex gap-4 relative">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                placeholder="Add specific skill..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none focus:border-indigo-500"
                              />
                              {skillSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                  {skillSuggestions.map((skill, idx) => (
                                    <button
                                      key={idx}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors font-medium text-slate-700"
                                      onClick={(e) => handleAddSkill(e, skill)}
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={handleAddSkill} className="px-10 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Add</button>
                          </div>
                          {errors.requiredSkills && <p className="text-rose-500 text-xs font-bold ml-1">{errors.requiredSkills.message}</p>}
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {requiredSkills.map(skill => {
                              const skillName = typeof skill === 'string' ? skill : skill.name;
                              return (
                                <div key={skillName} className="bg-indigo-50 border border-indigo-100 text-indigo-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase flex items-center gap-3">
                                  {skillName}
                                  <button type="button" onClick={() => handleRemoveSkill(skillName)}><X size={14} /></button>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 ${errors.requiredDegreeField ? 'text-rose-500' : 'text-slate-900'}`}>
                            Accepted Degree Fields <span className="text-rose-500 ml-1 font-bold text-sm">*</span>
                          </label>
                          <div className="flex gap-4 relative">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={degreeInput}
                                onChange={(e) => handleDegreeInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddDegree(e)}
                                placeholder="e.g. Computer Science, IT, Software Engineering..."
                                className={`w-full bg-slate-50 border rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all placeholder:text-slate-500 shadow-sm ${errors.requiredDegreeField ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
                              />
                              {degreeSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                  {degreeSuggestions.map((degree, idx) => (
                                    <button
                                      key={idx}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors font-medium text-slate-700"
                                      onClick={(e) => handleAddDegree(e, degree)}
                                    >
                                      {degree}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button onClick={handleAddDegree} className="px-10 bg-white border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm outline-none transition-all">
                              Add Degree
                            </button>
                          </div>
                          {errors.requiredDegreeField && <p className="text-rose-500 text-xs font-bold ml-1">{errors.requiredDegreeField.message}</p>}
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {requiredDegreeField.map(degree => (
                              <div key={degree} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3">
                                {degree}
                                <button onClick={() => handleRemoveDegree(degree)} className="hover:text-rose-500 transition-colors">
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <label className="flex items-center gap-3 cursor-pointer group mt-7 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#6366F1]/30 transition-all">
                            <div
                              onClick={() => setPrefersExperienced(prev => !prev)}
                              className={`w-10 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors ${prefersExperienced ? 'bg-[#6366F1]' : 'bg-slate-300'}`}
                            >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${prefersExperienced ? 'translate-x-4' : 'translate-x-0'}`} />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">Prefers Experienced Candidates</span>
                              <span className="text-[9px] font-semibold text-slate-500 uppercase">Prioritize students with past internships</span>
                            </div>
                          </label>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                          <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#6366F1]/30 transition-all">
                              <div
                                onClick={() => {
                                  setIsGpaMandatory(prev => !prev);
                                  if (isGpaMandatory) setValue('minimumGPA', '0.0');
                                }}
                                className={`w-10 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors ${isGpaMandatory ? 'bg-[#6366F1]' : 'bg-slate-300'}`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${isGpaMandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">Require Minimum GPA</span>
                                <span className="text-[9px] font-semibold text-slate-500 uppercase">Enforce a grade threshold for applicants</span>
                              </div>
                            </label>

                            {isGpaMandatory && (
                              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <CustomInput
                                  label="Minimum GPA Requirement (0.0 to 4.0)"
                                  icon={GraduationCap}
                                  name="minimumGPA"
                                  value={formValues.minimumGPA}
                                  onChange={handleGpaChange}
                                  type="number"
                                  placeholder="e.g. 3.0"
                                  step="0.01"
                                  min="0"
                                  max="4.0"
                                />
                              </div>
                            )}
                          </div>
                          <div>
                            <CustomInput
                              label="Academic Standard"
                              icon={GraduationCap}
                              placeholder="e.g. Master's in Design"
                              list="academic-standards"
                              {...register('educationRequirements')}
                            />
                            <datalist id="academic-standards">
                              <option value="High School Diploma" />
                              <option value="Certificate" />
                              <option value="Associate's Degree" />
                              <option value="Bachelor's Degree" />
                              <option value="Master's Degree" />
                              <option value="Doctorate / PhD" />
                            </datalist>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Seniority"
                            icon={Layers}
                            options={experienceLevels}
                            {...register('experienceLevel')}
                            error={!!errors.experienceLevel}
                            errorMessage={errors.experienceLevel?.message}
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest text-slate-900 mb-2.5 ml-1 ${errors.description ? 'text-rose-500' : ''}`}>
                            Role Intelligence (Description) <span className="text-rose-500 ml-1 font-bold text-sm">*</span>
                          </label>
                          <textarea
                            {...register('description')}
                            className={`w-full bg-slate-50 border rounded-[2rem] py-6 px-6 text-slate-900 font-bold h-44 resize-none transition-all ${errors.description ? 'border-rose-500 focus:ring-4 focus:ring-rose-500/10' : 'border-slate-200 focus:border-indigo-500'}`}
                          />
                          {errors.description && <p className="text-rose-500 text-xs font-bold ml-1">{errors.description.message}</p>}
                        </div>
                        <div className="md:col-span-2">
                          <CustomInput
                            label="MONTHLY STIPEND (RS)"
                            icon={Banknote}
                            type="number"
                            name="stipendAmount"
                            value={formValues.stipendAmount}
                            onChange={handleStipendChange}
                            min="0"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1 }} className="bg-rose-50 border border-rose-100 text-rose-500 p-6 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase shadow-lg">
                      <AlertTriangle size={20} /> {error}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Action Footer */}
            <div className="p-10 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 relative z-20">
              <button
                onClick={prevStep}
                className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] px-8 py-5 rounded-2xl transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
              >
                <ChevronLeft size={16} /> Previous
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-4 bg-[#6366F1] text-white font-black uppercase text-[11px] tracking-[0.3em] px-12 py-5 rounded-2xl hover:bg-[#4F46E5] shadow-lg"
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex items-center gap-5 bg-[#6366F1] text-white font-black uppercase text-sm tracking-[0.4em] px-16 py-6 rounded-3xl hover:bg-[#4F46E5] shadow-2xl active:scale-95 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Zap size={24} fill="currentColor" />}
                  Finalize Protocol
                </button>
              )}
            </div>
          </div>

          {/* Sidebar Preview Column */}
          <div className="w-5/12 bg-gradient-to-br from-indigo-600 to-indigo-700 relative flex flex-col p-12 text-white overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[80px] -mr-48 -mt-48 pointer-events-none" />
            <header className="mb-0 opacity-40">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Preview</p>
            </header>
            <div className="flex-1 flex flex-col justify-center">
              <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 space-y-8 shadow-2xl">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10">
                  <Building size={32} />
                </div>
                <div>
                  <h3 className="text-4xl font-black text-white tracking-tighter">{formValues.position || 'Protocol Designer'}</h3>
                  <p className="text-indigo-100 font-bold text-lg mt-2">{user?.companyName || 'Incubator'}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {formValues.locationType || 'Remote'}
                    {formValues.location && <span> | {formValues.location}</span>}
                  </div>
                  <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                    {formValues.duration ? (durationOptions.find(o => o.value === formValues.duration)?.label || '6 Months') : '6M'}
                  </div>
                </div>
                <div className="block border-t border-white/10 pt-6">
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-3 italic">
                    {formValues.description || 'Live transmission of role metadata will appear here...'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default EditInternshipPage;
