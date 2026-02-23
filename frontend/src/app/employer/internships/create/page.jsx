'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  Users,
  Zap,
  Code,
  Plus,
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

// UI Components
import CustomInput from '@/components/ui/CustomInput';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomButton from '@/components/ui/CustomButton';
import Stepper from '@/components/ui/Stepper';
import { useAuth } from '@/context/AuthContext';

const CreateInternshipPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const [formData, setFormData] = useState({
    position: '',
    category: '',
    locationType: '',
    duration: '',
    deadline: '',
    description: '',
    requiredSkills: [],
    preferredSkills: [],
    numberOfOpenings: '',
    perks: [],
    experienceLevel: '',
    educationRequirements: '',
    minimumGPA: '',
    prefersExperienced: false,
    stipendAmount: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [prefSkillInput, setPrefSkillInput] = useState('');
  const [perkInput, setPerkInput] = useState('');

  const steps = [
    { id: 1, title: 'Basics' },
    { id: 2, title: 'Requirements' },
    { id: 3, title: 'Details' },
  ];

  const categories = [
    'Web Development', 'Mobile App Development', 'UI/UX Design',
    'Data Science', 'Backend Development', 'Frontend Development',
    'DevOps', 'Machine Learning', 'Cloud Architecture', 'Database Design'
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

  // Auto-clear error on input change
  useEffect(() => {
    if (error) setError(null);
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setValidationErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleAddSkill = (e) => {
    if (e) e.preventDefault();
    const newSkill = skillInput.trim();
    if (newSkill && !formData.requiredSkills.some(s => s.name === newSkill)) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, { name: newSkill, mandatory: true, prefersSenior: false }],
      }));
      setSkillInput('');
      setValidationErrors(prev => ({ ...prev, requiredSkills: false }));
    }
  };

  const handleToggleSkillConfig = (skillName, field) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.map(s =>
        s.name === skillName ? { ...s, [field]: !s[field] } : s
      )
    }));
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s.name !== skillToRemove),
    }));
  };

  const handleAddPrefSkill = (e) => {
    if (e) e.preventDefault();
    const newSkill = prefSkillInput.trim();
    if (newSkill && !formData.preferredSkills.includes(newSkill)) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, newSkill],
      }));
      setPrefSkillInput('');
    }
  };

  const handleRemovePrefSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter(s => s !== skillToRemove),
    }));
  };


  const handleAddPerk = (e) => {
    if (e) e.preventDefault();
    const newPerk = perkInput.trim();
    if (newPerk && !formData.perks.includes(newPerk)) {
      setFormData(prev => ({
        ...prev,
        perks: [...prev.perks, newPerk],
      }));
      setPerkInput('');
    }
  };

  const handleRemovePerk = (perkToRemove) => {
    setFormData(prev => ({
      ...prev,
      perks: prev.perks.filter(p => p !== perkToRemove),
    }));
  };

  const validateStep = (step) => {
    const errors = {};
    if (step === 1) {
      if (!formData.position) errors.position = true;
      if (!formData.category) errors.category = true;
      if (!formData.locationType) errors.locationType = true;
      if (!formData.duration) errors.duration = true;
      if (!formData.numberOfOpenings) errors.numberOfOpenings = true;
      if (!formData.deadline) errors.deadline = true;
    }
    if (step === 2) {
      if (formData.requiredSkills.length === 0) errors.requiredSkills = true;
      if (!formData.experienceLevel) errors.experienceLevel = true;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError(null);
    } else {
      setError('Mission blocked: Please complete the highlighted fields below.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
    setValidationErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Final security check: Ensure description is present before deployment
    if (!formData.description) {
      setError('Final clearance failed: INTERNSHIP DESCRIPTION is required.');
      setValidationErrors({ description: true });
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 1. Collect all values from the multi-stage form state
      const payload = {
        positionTitle: formData.position,
        domain: formData.category,
        workEnvironment: formData.locationType,
        duration: formData.duration,
        expiryDate: formData.deadline,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        description: formData.description,
        numberOfOpenings: parseInt(formData.numberOfOpenings) || 1,
        experienceLevel: formData.experienceLevel,
        prefersExperienced: formData.prefersExperienced,
        educationRequirements: formData.educationRequirements,
        minimumGPA: formData.minimumGPA ? parseFloat(formData.minimumGPA) : null,
        stipend: {
          amount: parseInt(formData.stipendAmount) || 0,
          currency: 'RS'
        },
        perks: formData.perks,
        status: 'Hiring'
      };

      // 2. Transmit protocol to backend API
      const response = await axios.post('/api/internships/create', payload);

      if (response.data.success) {
        setSuccessMessage('Internship protocol successfully deployed! Redirecting to Dashboard...');

        // 3. Strategic redirection to Employer Dashboard
        setTimeout(() => router.push('/employer/dashboard'), 2000);
      }
    } catch (err) {
      // Capture and display protocol transmission errors
      setError(err.response?.data?.message || 'Protocol transmission failed. Please verify your connection.');
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
                    <p className="text-slate-400 mt-5 text-[10px] font-black uppercase tracking-[0.4em]">Step 0{currentStep} / Configuration Active</p>
                  </header>

                  <div className="grid grid-cols-1 gap-12">
                    {/* STEP 1: BASICS */}
                    {currentStep === 1 && (
                      <div className="space-y-10">
                        <CustomInput
                          label="Position Title"
                          icon={Briefcase}
                          name="position"
                          value={formData.position}
                          onChange={handleInputChange}
                          error={validationErrors.position}
                          placeholder="e.g. Lead Product Architect"
                          required
                        />
                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Domain Category"
                            icon={Code}
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            options={categories}
                            error={validationErrors.category}
                            required
                          />
                          <CustomSelect
                            label="Work Environment"
                            icon={MapPin}
                            name="locationType"
                            value={formData.locationType}
                            onChange={handleInputChange}
                            options={locationTypes}
                            error={validationErrors.locationType}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-10">
                          <CustomSelect
                            label="Tenure Duration"
                            icon={Clock}
                            name="duration"
                            value={formData.duration}
                            onChange={handleInputChange}
                            options={durationOptions}
                            error={validationErrors.duration}
                            required
                          />
                          <CustomInput
                            label="Resource Openings"
                            icon={Users}
                            type="number"
                            name="numberOfOpenings"
                            value={formData.numberOfOpenings}
                            onChange={handleInputChange}
                            error={validationErrors.numberOfOpenings}
                            placeholder="01"
                            min="1"
                            required
                          />
                        </div>
                        <CustomInput
                          label="Posting Expiry Date"
                          icon={Calendar}
                          type="date"
                          name="deadline"
                          value={formData.deadline}
                          onChange={handleInputChange}
                          error={validationErrors.deadline}
                          required
                        />
                      </div>
                    )}

                    {/* STEP 2: REQUIREMENTS */}
                    {currentStep === 2 && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 ${validationErrors.requiredSkills ? 'text-rose-500' : 'text-slate-900'}`}>Prerequisite Skills *</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                              placeholder="Type a skill..."
                              className={`flex-1 bg-slate-50 border rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none transition-all placeholder:text-slate-300 shadow-sm ${validationErrors.requiredSkills ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
                            />
                            <button
                              onClick={handleAddSkill}
                              className="px-10 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all outline-none"
                            >
                              Connect
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-3 pt-2">
                            {formData.requiredSkills.map(skill => (
                              <div key={skill.name} className="bg-white border border-slate-200 text-slate-700 p-4 rounded-2xl flex flex-col gap-3 shadow-sm min-w-[200px] animate-in fade-in zoom-in duration-300">
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-xs font-black uppercase tracking-widest text-[#6366F1]">{skill.name}</span>
                                  <button onClick={() => handleRemoveSkill(skill.name)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                    <X size={16} strokeWidth={3} />
                                  </button>
                                </div>
                                <div className="space-y-2 pt-2 border-t border-slate-100">
                                  <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Mandatory</span>
                                    <div
                                      onClick={() => handleToggleSkillConfig(skill.name, 'mandatory')}
                                      className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${skill.mandatory ? 'bg-emerald-400' : 'bg-slate-200'}`}
                                    >
                                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${skill.mandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                  </label>
                                  <label className="flex items-center justify-between cursor-pointer group">
                                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Prefers Senior</span>
                                    <div
                                      onClick={() => handleToggleSkillConfig(skill.name, 'prefersSenior')}
                                      className={`w-8 h-4 rounded-full flex items-center p-0.5 transition-colors ${skill.prefersSenior ? 'bg-[#6366F1]' : 'bg-slate-200'}`}
                                    >
                                      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${skill.prefersSenior ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* PREFERRED SKILLS */}
                        <div className="space-y-4">
                          <label className="block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 text-slate-900">Preferred / Bonus Skills</label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={prefSkillInput}
                              onChange={(e) => setPrefSkillInput(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddPrefSkill(e)}
                              placeholder="Type a bonus skill..."
                              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none focus:border-[#6366F1]/50 transition-all placeholder:text-slate-300 shadow-sm"
                            />
                            <button
                              onClick={handleAddPrefSkill}
                              className="px-10 bg-white border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all outline-none"
                            >
                              Add Bonus
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {formData.preferredSkills.map(skill => (
                              <div key={skill} className="bg-slate-100 border border-slate-200 text-slate-600 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
                                {skill}
                                <button onClick={() => handleRemovePrefSkill(skill)} className="hover:text-rose-500 transition-colors">
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
                            name="experienceLevel"
                            value={formData.experienceLevel}
                            onChange={handleInputChange}
                            options={experienceLevels}
                            error={validationErrors.experienceLevel}
                            required
                          />
                          <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group mt-7 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#6366F1]/30 transition-all">
                              <div
                                onClick={() => setFormData(prev => ({ ...prev, prefersExperienced: !prev.prefersExperienced }))}
                                className={`w-10 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors ${formData.prefersExperienced ? 'bg-[#6366F1]' : 'bg-slate-300'}`}
                              >
                                <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.prefersExperienced ? 'translate-x-4' : 'translate-x-0'}`} />
                              </div>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">Prefers Experienced Candidates</span>
                                <span className="text-[9px] font-semibold text-slate-400 uppercase">Prioritize students with past internships</span>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-10">
                          <CustomInput
                            label="Minimum GPA"
                            icon={GraduationCap}
                            name="minimumGPA"
                            value={formData.minimumGPA}
                            onChange={handleInputChange}
                            type="number"
                            placeholder="e.g. 3.0"
                            step="0.1"
                            min="0"
                            max="4.0"
                          />
                          <CustomInput
                            label="Academic Standard"
                            icon={GraduationCap}
                            name="educationRequirements"
                            value={formData.educationRequirements}
                            onChange={handleInputChange}
                            placeholder="e.g. Master's in Design"
                          />
                        </div>
                      </div>
                    )}

                    {/* STEP 3: DETAILS */}
                    {currentStep === 3 && (
                      <div className="space-y-10">
                        <div className="space-y-4">
                          <label className={`block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 ${validationErrors.description ? 'text-rose-500' : 'text-slate-900'}`}>INTERNSHIP DESCRIPTION *</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Provide an in-depth overview of the role..."
                            className={`w-full bg-slate-50 border rounded-[2rem] py-6 px-6 text-slate-900 font-bold focus:outline-none transition-all h-44 resize-none custom-scrollbar-light shadow-sm ${validationErrors.description ? 'border-rose-500/50 focus:border-rose-500' : 'border-slate-200 focus:border-[#6366F1]/50'}`}
                            required
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-10 items-end">
                          <CustomInput
                            label="MONTHLY STIPEND (RS)"
                            icon={Banknote}
                            type="number"
                            name="stipendAmount"
                            value={formData.stipendAmount}
                            onChange={handleInputChange}
                            placeholder="15000"
                          />
                          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black uppercase tracking-widest text-[#6366F1] mb-1.5 leading-none">Submission Tip</p>
                            <p className="text-[11px] font-bold text-slate-500 leading-relaxed">Enter '0' for experience-only positions.</p>
                          </div>
                        </div>
                        <div className="space-y-4 pt-2">
                          <label className="block text-xs font-black text-slate-900 uppercase tracking-widest ml-1 mb-2.5">PERKS & BENEFITS</label>
                          <div className="flex gap-4">
                            <div className="relative flex-1 group">
                              <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#6366F1] transition-colors" size={18} />
                              <input
                                type="text"
                                value={perkInput}
                                onChange={(e) => setPerkInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddPerk(e)}
                                placeholder="e.g. Mentorship access..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 px-6 text-slate-900 font-bold focus:outline-none focus:border-[#6366F1]/50 transition-all placeholder:text-slate-300"
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
                            {formData.perks.map(perk => (
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
                className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] px-8 py-5 rounded-2xl transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'
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
                  onClick={handleSubmit}
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
                      {formData.position || 'Protocol Designer'}
                    </h3>
                    <p className="text-indigo-100 font-black mt-4 text-xl flex items-center gap-4 opacity-90">
                      <span className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)]" />
                      {user?.companyName || 'Incubator Labs'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10">
                      <MapPin size={16} className="text-emerald-300" /> {formData.locationType || 'Hybrid'}
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest flex items-center gap-3 border border-white/10">
                      <Clock size={16} className="text-indigo-200" /> {formData.duration ? (typeof formData.duration === 'string' ? formData.duration : durationOptions.find(o => o.value === formData.duration)?.label) || '6 Months' : '3 Mo'}
                    </div>
                  </div>

                  <div className="pt-8 border-t border-white/10 space-y-6">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mb-4">Skill Sequence</h4>
                      <div className="flex flex-wrap gap-3">
                        {formData.requiredSkills.length > 0 ? formData.requiredSkills.slice(0, 4).map(s => (
                          <span key={s.name} className="bg-white text-slate-900 px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md transition-transform hover:-translate-y-1">
                            {s.name} {s.mandatory && <span className="text-emerald-500 ml-1">•</span>}
                          </span>
                        )) : <span className="text-white/20 italic text-xs font-bold tracking-widest uppercase">Awaiting input...</span>}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-[2.5rem] p-6 border border-white/10 italic relative group overflow-hidden">
                      <div className="absolute inset-0 bg-white/5 -translate-x-full group-hover:translate-x-0 transition-transform duration-700 pointer-events-none" />
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-4 relative z-10 font-medium">
                        {formData.description || 'Define your internship description in stage 3 to synchronize this display with real-time candidate queries...'}
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
