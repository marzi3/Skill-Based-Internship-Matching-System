'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
 * Merged Zod schema covering all three steps.
 * Used with useForm for unified state, validated per-step via trigger().
 */
const fullInternshipSchema = z.object({
  // Step 1
  position: z.string().min(1, 'Position title is required').max(100, 'Position title cannot exceed 100 characters'),
  category: z.string().min(1, 'Domain category is required'),
  locationType: z.enum(['Remote', 'On-site', 'Hybrid', ''], { errorMap: () => ({ message: 'Work environment is required' }) }).refine(val => val !== '', { message: 'Work environment is required' }),
  location: z.string().min(1, 'Location is required'),
  duration: z.string().min(1, 'Duration is required'),
  numberOfOpenings: z.coerce.number({ invalid_type_error: 'Must be a number' }).int('Must be a whole number').min(1, 'At least 1 opening is required'),
  deadline: z.string().min(1, 'Expiry date is required').refine(
    (val) => { const d = new Date(val); const today = new Date(); today.setHours(0, 0, 0, 0); return d > today; },
    { message: 'Expiry date must be in the future' }
  ),
  // Step 2 — arrays validated manually via setError/clearErrors
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

const CreateInternshipPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // ─── useForm with Zod ──────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
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

  // Watch all values for live preview
  const formValues = watch();

  // ─── Array state (tags — managed outside react-hook-form) ──────────────────
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [preferredSkills, setPreferredSkills] = useState([]);
  const [requiredDegreeField, setRequiredDegreeField] = useState([]);
  const [perks, setPerks] = useState([]);
  const [prefersExperienced, setPrefersExperienced] = useState(false);
  const [isGpaMandatory, setIsGpaMandatory] = useState(false);

  const [skillInput, setSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [degreeInput, setDegreeInput] = useState('');
  const [perkInput, setPerkInput] = useState('');

  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [prefSkillSuggestions, setPrefSkillSuggestions] = useState([]);
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

  // Auto-clear top-level error
  useEffect(() => {
    if (error) setError(null);
  }, [formValues.position, formValues.category, formValues.location, formValues.duration, formValues.deadline, formValues.description]);

  // ─── Tag Handlers ──────────────────────────────────────────────────────────
  const handleAddSkill = (e, skillNameOverride) => {
    if (e) e.preventDefault();
    const newSkill = (skillNameOverride || skillInput).trim();
    if (newSkill && !requiredSkills.some(s => s.name === newSkill)) {
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

  const handleToggleSkillConfig = (skillName, field) => {
    setRequiredSkills(prev =>
      prev.map(s => s.name === skillName ? { ...s, [field]: !s[field] } : s)
    );
  };

  const handleRemoveSkill = (skillToRemove) => {
    setRequiredSkills(prev => prev.filter(s => s.name !== skillToRemove));
  };

  const handleAddPrefSkill = (e, skillNameOverride) => {
    if (e) e.preventDefault();
    const newSkill = (skillNameOverride || prefSkillInput).trim();
    if (newSkill && !preferredSkills.includes(newSkill)) {
      setPreferredSkills(prev => [...prev, newSkill]);
      setPrefSkillInput('');
      setPrefSkillSuggestions([]);
    }
  };

  const handlePrefSkillInputChange = (value) => {
    setPrefSkillInput(value);
    const filtered = skillsData.filter(s => 
      s.toLowerCase().includes(value.toLowerCase())
    ).slice(0, 5);
    setPrefSkillSuggestions(value ? filtered : []);
  };

  const handleRemovePrefSkill = (skillToRemove) => {
    setPreferredSkills(prev => prev.filter(s => s !== skillToRemove));
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

  // ─── Step Validation via Zod trigger() ─────────────────────────────────────
  const nextStep = async () => {
    let valid = false;

    if (currentStep === 1) {
      valid = await trigger(STEP_1_FIELDS);
    } else if (currentStep === 2) {
      valid = await trigger(STEP_2_FIELDS);
      // Validate arrays manually
      let arrayErrors = false;
      if (requiredSkills.length === 0) {
        setFieldError('requiredSkills', { type: 'manual', message: 'At least one required skill is needed' });
        arrayErrors = true;
      }
      if (requiredDegreeField.length === 0) {
        setFieldError('requiredDegreeField', { type: 'manual', message: 'At least one accepted degree field is required' });
        arrayErrors = true;
      }
      if (arrayErrors) valid = false;
    }

    if (valid) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError(null);
    } else {
      setError('Mission blocked: Please complete the highlighted fields below.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  // ─── Final Submission ──────────────────────────────────────────────────────
  const onSubmit = async (data) => {
    // Validate Step 3 description
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
        preferredSkills: preferredSkills,
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

      const response = await axios.post('/internships/create', payload);

      if (response.data.success) {
        setSuccessMessage('Internship protocol successfully deployed! Redirecting to Dashboard...');
        setTimeout(() => router.push('/employer/dashboard'), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message ||
        (err.response?.data?.errors && err.response.data.errors.map(e => e.msg).join(' | ')) ||
        'Protocol transmission failed. Please verify your connection.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex items-center justify-center p-6 overflow-hidden font-sans">
      <div className="w-full max-w-7xl h-full flex flex-col">
        {/* Header Area */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <Link href="/employer/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-all font-black group">
            <div className="p-2 rounded-xl group-hover:bg-white transition-all shadow-sm">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span className="text-[10px] uppercase tracking-[0.2em] ml-2 font-black">Main Dashboard</span>
          </Link>
          <Stepper currentStep={currentStep} steps={steps} />
          <div className="w-32" />
        </div>

        {/* Outer Container */}
        <div className="flex-1 flex overflow-hidden rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.08)] border border-slate-100 bg-white relative">

          {/* Success Overlay */}
          <AnimatePresence>
            {successMessage && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="max-w-md space-y-6"
                >
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Mission Accomplished</h3>
                  <p className="text-slate-500 font-bold leading-relaxed">{successMessage}</p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form Column (7/12) */}
          <div className="w-7/12 flex flex-col bg-white overflow-hidden relative border-r border-slate-50">
            <div className="flex-1 p-16 overflow-y-auto custom-scrollbar relative z-10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="space-y-12"
                >
                  <header>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                      {steps[currentStep - 1].title} <span className="text-[#6366F1] font-medium tracking-normal italic">Protocol</span>
                    </h2>
                    <p className="text-slate-500 mt-5 text-[10px] font-black uppercase tracking-[0.4em]">Step 0{currentStep} / Configuration Active</p>
                  </header>

                  <div className="grid grid-cols-1 gap-12">
                    {/* STEP 1: BASICS */}
                    {currentStep === 1 && (
                      <div className="space-y-10">
                        <CustomInput
                          label="Position Title"
                          icon={Briefcase}
                          placeholder="e.g. Lead Product Architect"
                          required
                          {...register('position')}
                          error={!!errors.position}
                          errorMessage={errors.position?.message}
                        />
                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Domain Category"
                            icon={Code}
                            options={categories}
                            required
                            {...register('category')}
                            error={!!errors.category}
                            errorMessage={errors.category?.message}
                          />
                          <CustomSelect
                            label="Work Environment"
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
                            label="Tenure Duration"
                            icon={Clock}
                            options={durationOptions}
                            required
                            {...register('duration')}
                            error={!!errors.duration}
                            errorMessage={errors.duration?.message}
                          />
                          <CustomInput
                            label="Resource Openings"
                            icon={Users}
                            type="number"
                            placeholder="01"
                            min="1"
                            required
                            {...register('numberOfOpenings')}
                            error={!!errors.numberOfOpenings}
                            errorMessage={errors.numberOfOpenings?.message}
                          />
                        </div>
                        <CustomInput
                          label="Posting Expiry Date"
                          icon={Calendar}
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          required
                          {...register('deadline')}
                          error={!!errors.deadline}
                          errorMessage={errors.deadline?.message}
                        />
                      </div>
                    )}

                    {/* STEP 2: REQUIREMENTS */}
                    {currentStep === 2 && (
                      <div className="space-y-10">
                        {/* Required Skills */}
                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 ${errors.requiredSkills ? 'text-rose-500' : 'text-slate-900'}`}>
                            Prerequisite Skills <span className="text-rose-500 ml-1 font-bold text-sm">*</span>
                          </label>
                          <div className="flex gap-4 relative">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => handleSkillInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                placeholder="Type a skill..."
                                aria-invalid={errors.requiredSkills ? 'true' : undefined}
                                className={`w-full bg-slate-50 border rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all placeholder:text-slate-500 shadow-sm ${errors.requiredSkills ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/50' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
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
                            <button
                              onClick={handleAddSkill}
                              className="px-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all outline-none"
                            >
                              Connect
                            </button>
                          </div>
                          <AnimatePresence>
                            {errors.requiredSkills && (
                              <motion.p role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold ml-1">{errors.requiredSkills.message}</motion.p>
                            )}
                          </AnimatePresence>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {requiredSkills.map(skill => {
                              const skillName = typeof skill === 'string' ? skill : skill.name;
                              return (
                                <div key={skillName} className="bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl flex flex-col gap-3 shadow-sm min-w-[200px] animate-in fade-in zoom-in duration-300">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className="text-xs font-black uppercase tracking-widest text-[#6366F1]">{skillName}</span>
                                    <button onClick={() => handleRemoveSkill(skillName)} className="text-slate-500 hover:text-rose-500 transition-colors">
                                      <X size={16} strokeWidth={3} />
                                    </button>
                                  </div>
                                  <div className="space-y-2 pt-2 border-t border-slate-100">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Mandatory</span>
                                      <div
                                        onClick={() => handleToggleSkillConfig(skillName, 'mandatory')}
                                        className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${skill.mandatory ? 'bg-emerald-400' : 'bg-slate-200'}`}
                                      >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${skill.mandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                                      </div>
                                    </label>
                                    <label className="flex items-center justify-between cursor-pointer group">
                                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Prefers Senior</span>
                                      <div
                                        onClick={() => handleToggleSkillConfig(skillName, 'prefersSenior')}
                                        className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${skill.prefersSenior ? 'bg-[#6366F1]' : 'bg-slate-200'}`}
                                      >
                                        <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${skill.prefersSenior ? 'translate-x-4' : 'translate-x-0'}`} />
                                      </div>
                                    </label>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* Preferred Skills */}
                        <div className="space-y-4">
                          <label className="block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 text-slate-900">Preferred / Bonus Skills</label>
                          <div className="flex gap-4 relative">
                            <div className="flex-1 relative">
                              <input
                                type="text"
                                value={prefSkillInput}
                                onChange={(e) => handlePrefSkillInputChange(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPrefSkill(e)}
                                placeholder="Type a bonus skill..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none focus:border-[#6366F1]/50 transition-all placeholder:text-slate-500 shadow-sm"
                              />
                              {prefSkillSuggestions.length > 0 && (
                                <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                  {prefSkillSuggestions.map((skill, idx) => (
                                    <button
                                      key={idx}
                                      className="w-full text-left px-4 py-2 text-sm hover:bg-indigo-50 transition-colors font-medium text-slate-700"
                                      onClick={(e) => handleAddPrefSkill(e, skill)}
                                    >
                                      {skill}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <button
                              onClick={handleAddPrefSkill}
                              className="px-10 bg-white border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all outline-none"
                            >
                              Add Bonus
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {preferredSkills.map(skill => (
                              <div key={skill} className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                {skill}
                                <button onClick={() => handleRemovePrefSkill(skill)} className="hover:text-rose-500 transition-colors">
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Required Degrees */}
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
                                aria-invalid={errors.requiredDegreeField ? 'true' : undefined}
                                className={`w-full bg-slate-50 border rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all placeholder:text-slate-500 shadow-sm ${errors.requiredDegreeField ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/50' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
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
                            <button
                              onClick={handleAddDegree}
                              className="px-10 bg-white border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all outline-none"
                            >
                              Add Degree
                            </button>
                          </div>
                          <AnimatePresence>
                            {errors.requiredDegreeField && (
                              <motion.p role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold ml-1">{errors.requiredDegreeField.message}</motion.p>
                            )}
                          </AnimatePresence>
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {requiredDegreeField.map(degree => (
                              <div key={degree} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                {degree}
                                <button onClick={() => handleRemoveDegree(degree)} className="hover:text-rose-500 transition-colors">
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Seniority Level"
                            icon={Layers}
                            options={experienceLevels}
                            required
                            {...register('experienceLevel')}
                            error={!!errors.experienceLevel}
                            errorMessage={errors.experienceLevel?.message}
                          />
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
                      </div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {currentStep === 3 && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label htmlFor="description" className={`block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 ${errors.description ? 'text-rose-500' : 'text-slate-900'}`}>
                            INTERNSHIP DESCRIPTION <span className="text-rose-500 ml-1 font-bold text-sm">*</span>
                          </label>
                          <textarea
                            {...register('description')}
                            id="description"
                            placeholder="Provide an in-depth overview of the role..."
                            aria-invalid={errors.description ? 'true' : undefined}
                            aria-describedby={errors.description ? 'description-error' : undefined}
                            className={`w-full bg-slate-50 border rounded-[2rem] py-6 px-6 text-slate-900 font-bold focus:outline-none transition-all h-44 resize-none custom-scrollbar-light shadow-sm ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/50' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
                          />
                          <AnimatePresence>
                            {errors.description && (
                              <motion.p id="description-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} className="text-rose-500 text-xs font-bold ml-1">{errors.description.message}</motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                        <div className="grid grid-cols-2 gap-10 items-end">
                          <CustomInput
                            label="MONTHLY STIPEND (RS)"
                            icon={Banknote}
                            type="number"
                            name="stipendAmount"
                            value={formValues.stipendAmount}
                            onChange={handleStipendChange}
                            min="0"
                            placeholder="15000"
                          />
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#6366F1] mb-1.5 leading-none">Submission Tip</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Enter &apos;0&apos; for experience-only positions.</p>
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1 mb-2.5">PERKS & BENEFITS</label>
                          <div className="flex gap-4">
                            <div className="relative flex-1 group">
                              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#6366F1] transition-colors" size={18} />
                              <input
                                type="text"
                                value={perkInput}
                                onChange={(e) => setPerkInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPerk(e)}
                                placeholder="e.g. Mentorship access..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 px-6 text-slate-900 font-bold focus:outline-none focus:border-[#6366F1]/50 transition-all placeholder:text-slate-500"
                              />
                            </div>
                            <button
                              onClick={handleAddPerk}
                              className="px-8 border-2 border-slate-200 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-[#6366F1] hover:text-[#6366F1] transition-all"
                            >
                              Include
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2.5">
                            {perks.map(perk => (
                              <div key={perk} className="bg-emerald-50 border border-emerald-100 text-emerald-600 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                {perk}
                                <button onClick={() => handleRemovePerk(perk)} className="hover:text-rose-500 transition-colors">
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-rose-50 border-2 border-rose-100 text-rose-500 p-6 rounded-[2rem] flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg"
                    >
                      <AlertTriangle size={20} strokeWidth={3} /> {error}
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-10 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 relative z-20">
              <button
                onClick={prevStep}
                className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] px-8 py-5 rounded-2xl transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                <ChevronLeft size={16} strokeWidth={3} /> Rewind Step
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-4 bg-[#6366F1] text-white font-black uppercase text-[11px] tracking-[0.3em] px-12 py-5 rounded-2xl hover:bg-[#4F46E5] hover:scale-[1.02] shadow-[0_20px_40px_rgba(99,102,241,0.25)] active:scale-95 transition-all"
                >
                  Forward Stage <ChevronRight size={16} strokeWidth={3} />
                </button>
              ) : (
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  className="flex items-center gap-5 bg-[#6366F1] text-white font-black uppercase text-sm tracking-[0.4em] px-16 py-6 rounded-3xl hover:bg-[#4F46E5] shadow-[0_25px_50px_rgba(99,102,241,0.4)] active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader className="animate-spin" size={20} /> : <Zap size={24} fill="currentColor" />}
                  Deploy Post
                </button>
              )}
            </div>
          </div>

          {/* Preview Column (5/12) */}
          <div className="w-5/12 bg-gradient-to-br from-[#6366F1] to-[#4F46E5] relative flex flex-col p-12 text-white overflow-hidden">
            {/* Visual Decoration */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <header className="mb-8 flex items-center gap-6 relative z-10 opacity-60 shrink-0">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                <Eye size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.5em] leading-none">Live Projection</p>
                <p className="text-[9px] font-black uppercase tracking-widest mt-2 opacity-50">Synchronized Candidate UI</p>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar-light relative z-10 pr-2">
              <div className="flex flex-col justify-center min-h-full py-2 scale-[0.8] lg:scale-[0.8] xl:scale-[0.85] origin-top">
                {/* Translucent UI Card */}
                <div className="bg-white/10 backdrop-blur-3xl border border-white/20 rounded-[4rem] p-10 shadow-[0_60px_100px_rgba(0,0,0,0.1)] space-y-6 group">
                  <div className="flex items-center justify-between">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center border border-white/10 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                      <Building size={36} className="text-white opacity-80" />
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="bg-emerald-400 text-[#0F172A] px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/30">
                        Hiring active
                      </div>
                      <span className="text-[9px] font-black tracking-widest opacity-30 mt-3 italic uppercase">Ref. PRO-9921</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-[2.5rem] font-black leading-[1.1] tracking-tighter text-white drop-shadow-lg">
                      {formValues.position || 'Protocol Designer'}
                    </h3>
                    <p className="text-indigo-100 font-black mt-4 text-xl flex items-center gap-4 opacity-90">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]" />
                      {user?.companyName || 'Company Name'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10">
                      <MapPin size={16} className="text-emerald-300" /> {formValues.locationType || 'Hybrid'}
                      {formValues.location && <span className="text-emerald-100/50">| {formValues.location}</span>}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10">
                      <Clock size={16} className="text-indigo-200" /> {formValues.duration ? (typeof formValues.duration === 'string' ? formValues.duration : durationOptions.find(o => o.value === formValues.duration)?.label) || '6 Months' : '3 Mo'}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Skill Sequence</h4>
                      <div className="flex flex-wrap gap-3">
                        {requiredSkills.length > 0 ? requiredSkills.slice(0, 4).map(s => {
                          const name = typeof s === 'string' ? s : s.name;
                          return (
                            <span key={name} className="bg-white text-slate-900 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-transform hover:-translate-y-1">
                              {name} {s.mandatory && <span className="text-emerald-500 ml-1">•</span>}
                            </span>
                          )
                        }) : <span className="text-white/20 italic text-xs font-bold tracking-widest uppercase">Awaiting input...</span>}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 italic relative group overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 pointer-events-none" />
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-4 relative z-10 font-medium">
                        {formValues.description || 'Define your internship description in stage 3 to synchronize this display with real-time candidate queries...'}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button disabled className="w-full py-5 bg-white text-[#6366F1] rounded-[2rem] font-black uppercase tracking-[0.4em] text-[10px] shadow-[0_20px_50px_rgba(255,255,255,0.15)] opacity-90">
                      Locked Interface
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        
        .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(99, 102, 241, 0.1); border-radius: 10px; }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(45%) sepia(80%) saturate(1500%) hue-rotate(220deg) brightness(95%) contrast(100%);
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CreateInternshipPage;
