'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    X,
    Loader,
    AlertTriangle,
    ChevronRight,
    ChevronLeft,
    Building,
    Calendar,
    CheckCircle2,
    Eye,
    Layers,
    GraduationCap,
    Banknote,
} from 'lucide-react';

// UI Components
import CustomInput from '@/components/ui/CustomInput';
import CustomSelect from '@/components/ui/CustomSelect';
import CustomButton from '@/components/ui/CustomButton';
import Stepper from '@/components/ui/Stepper';
import { useAuth } from '@/context/AuthContext';

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
    const [validationErrors, setValidationErrors] = useState({});

    const [formData, setFormData] = useState({
        position: '',
        category: '',
        locationType: '',
        location: '',
        duration: '',
        deadline: '',
        description: '',
        requiredSkills: [],
        numberOfOpenings: '',
        perks: [],
        experienceLevel: '',
        educationRequirements: '',
        requiredDegreeField: [],
        stipendAmount: '',
        isGpaMandatory: false,
        minimumGPA: '',
        prefersExperienced: false,
    });

    const [skillInput, setSkillInput] = useState('');
    const [perkInput, setPerkInput] = useState('');
    const [degreeInput, setDegreeInput] = useState('');

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

    useEffect(() => {
        const fetchInternship = async () => {
            try {
                setFetching(true);
                const response = await axios.get(`/api/internships/${id}`);
                const data = response.data.data;

                setFormData({
                    position: data.positionTitle,
                    category: data.domain,
                    locationType: data.workEnvironment,
                    location: data.location || '',
                    duration: data.duration,
                    deadline: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : '',
                    description: data.description,
                    requiredSkills: data.requiredSkills || [],
                    numberOfOpenings: data.numberOfOpenings || '',
                    perks: data.perks || [],
                    experienceLevel: data.experienceLevel || '',
                    educationRequirements: data.educationRequirements || '',
                    requiredDegreeField: data.requiredDegreeField || [],
                    stipendAmount: data.stipend?.amount || '',
                    isGpaMandatory: !!data.minimumGPA,
                    minimumGPA: data.minimumGPA || '',
                    prefersExperienced: data.prefersExperienced || false,
                });
                setFetching(false);
            } catch (err) {
                console.error('Failed to fetch internship details:', err);
                setError('Failed to load internship content. Access denied or link expired.');
                setFetching(false);
            }
        };

        if (id) fetchInternship();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setValidationErrors(prev => ({ ...prev, [name]: false }));
    };

    const handleGpaChange = (e) => {
        let val = parseFloat(e.target.value);
        if (val > 4.0) e.target.value = 4.0;
        if (val < 0) e.target.value = 0;
        handleInputChange(e);
    };

    const handleStipendChange = (e) => {
        let val = parseInt(e.target.value);
        if (val < 0) e.target.value = 0;
        handleInputChange(e);
    };

    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
        const newSkill = skillInput.trim();
        if (newSkill && !formData.requiredSkills.some(s => (typeof s === 'string' ? s : s.name) === newSkill)) {
            setFormData(prev => ({
                ...prev,
                requiredSkills: [...prev.requiredSkills, { name: newSkill, mandatory: true, prefersSenior: false }],
            }));
            setSkillInput('');
            setValidationErrors(prev => ({ ...prev, requiredSkills: false }));
        }
    };

    const handleRemoveSkill = (skillToRemoveName) => {
        setFormData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.filter(s => (typeof s === 'string' ? s : s.name) !== skillToRemoveName),
        }));
    };

    const handleAddDegree = (e) => {
        if (e) e.preventDefault();
        const newDegree = degreeInput.trim();
        if (newDegree && !formData.requiredDegreeField.includes(newDegree)) {
            setFormData(prev => ({
                ...prev,
                requiredDegreeField: [...prev.requiredDegreeField, newDegree],
            }));
            setDegreeInput('');
        }
    };

    const handleRemoveDegree = (degreeToRemove) => {
        setFormData(prev => ({
            ...prev,
            requiredDegreeField: prev.requiredDegreeField.filter(d => d !== degreeToRemove),
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
        }
        if (step === 2) {
            if (formData.requiredSkills.length === 0) errors.requiredSkills = true;
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.description) {
            setError('Description protocol is required for deployment.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const payload = {
                positionTitle: formData.position,
                domain: formData.category,
                workEnvironment: formData.locationType,
                location: formData.location,
                duration: formData.duration,
                expiryDate: formData.deadline,
                requiredSkills: formData.requiredSkills,
                description: formData.description,
                numberOfOpenings: parseInt(formData.numberOfOpenings) || 1,
                experienceLevel: formData.experienceLevel,
                educationRequirements: formData.educationRequirements,
                requiredDegreeField: formData.requiredDegreeField,
                minimumGPA: formData.isGpaMandatory && formData.minimumGPA ? parseFloat(formData.minimumGPA) : null,
                prefersExperienced: formData.prefersExperienced || false,
                stipend: {
                    amount: parseInt(formData.stipendAmount) || 0,
                    currency: 'INR'
                },
                perks: formData.perks
            };

            const response = await axios.put(`/api/internships/${id}`, payload);

            if (response.data.success) {
                setSuccessMessage('Internship protocol successfully updated. Synchronizing dashboard...');
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

                    {successMessage && (
                        <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-md flex items-center justify-center text-center p-12">
                            <div className="max-w-md space-y-6 animate-in zoom-in duration-500">
                                <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl">
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Update Deployed</h3>
                                <p className="text-slate-500 font-bold leading-relaxed">{successMessage}</p>
                            </div>
                        </div>
                    )}

                    {/* Form Column */}
                    <div className="w-7/12 flex flex-col bg-white overflow-hidden relative border-r border-slate-50">
                        <div className="flex-1 p-16 overflow-y-auto custom-scrollbar relative z-10">
                            <div className="space-y-12">
                                <header>
                                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
                                        Edit <span className="text-[#6366F1] font-medium tracking-normal italic text-4xl">Posting</span>
                                    </h2>
                                    <p className="text-slate-400 mt-5 text-[10px] font-black uppercase tracking-[0.4em]">Modification Protocol Active</p>
                                </header>

                                <div className="grid grid-cols-1 gap-12">
                                    {currentStep === 1 && (
                                        <div className="space-y-10">
                                            <CustomInput
                                                label="Position Title"
                                                icon={Briefcase}
                                                name="position"
                                                value={formData.position}
                                                onChange={handleInputChange}
                                                error={validationErrors.position}
                                                required
                                            />
                                            <div className="grid grid-cols-2 gap-10">
                                                <CustomSelect
                                                    label="Domain"
                                                    icon={Code}
                                                    name="category"
                                                    value={formData.category}
                                                    onChange={handleInputChange}
                                                    options={categories}
                                                    error={validationErrors.category}
                                                    required
                                                />
                                                <CustomSelect
                                                    label="Environment"
                                                    icon={MapPin}
                                                    name="locationType"
                                                    value={formData.locationType}
                                                    onChange={handleInputChange}
                                                    options={locationTypes}
                                                    error={validationErrors.locationType}
                                                    required
                                                />
                                            </div>
                                            <CustomInput
                                                label="Specific Location"
                                                icon={Building}
                                                name="location"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                placeholder={formData.locationType === 'Remote' ? "e.g. US Only, Worldwide" : "e.g. San Francisco, CA"}
                                                required={formData.locationType !== 'Remote'}
                                            />
                                            <div className="grid grid-cols-2 gap-10">
                                                <CustomSelect
                                                    label="Duration"
                                                    icon={Clock}
                                                    name="duration"
                                                    value={formData.duration}
                                                    onChange={handleInputChange}
                                                    options={durationOptions}
                                                    error={validationErrors.duration}
                                                    required
                                                />
                                                <CustomInput
                                                    label="Openings"
                                                    icon={Users}
                                                    type="number"
                                                    name="numberOfOpenings"
                                                    value={formData.numberOfOpenings}
                                                    onChange={handleInputChange}
                                                    error={validationErrors.numberOfOpenings}
                                                    required
                                                />
                                            </div>
                                            <CustomInput
                                                label="Expiry Date"
                                                icon={Calendar}
                                                type="date"
                                                name="deadline"
                                                value={formData.deadline}
                                                onChange={handleInputChange}
                                                min={new Date().toISOString().split('T')[0]}
                                            />
                                        </div>
                                    )}

                                    {currentStep === 2 && (
                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <label className={`block text-xs font-black uppercase tracking-widest text-slate-900 mb-2`}>Skills Assessment *</label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={skillInput}
                                                        onChange={(e) => setSkillInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddSkill(e)}
                                                        placeholder="Add specific skill..."
                                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none"
                                                    />
                                                    <button onClick={handleAddSkill} className="px-10 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase">Add</button>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5 pt-2">
                                                    {formData.requiredSkills.map(skill => {
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

                                            {/* REQUIRED DEGREES CACHE */}
                                            <div className="space-y-4">
                                                <label className="block text-xs font-black uppercase tracking-widest ml-1 mb-2.5 text-slate-900">Accepted Degree Fields</label>
                                                <div className="flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={degreeInput}
                                                        onChange={(e) => setDegreeInput(e.target.value)}
                                                        onKeyDown={(e) => e.key === 'Enter' && handleAddDegree(e)}
                                                        placeholder="e.g. Computer Science, IT, Software Engineering..."
                                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-slate-900 font-bold focus:outline-none focus:border-[#6366F1]/50 transition-all placeholder:text-slate-300 shadow-sm"
                                                    />
                                                    <button
                                                        onClick={handleAddDegree}
                                                        className="px-10 bg-white border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-sm active:scale-95 transition-all outline-none"
                                                    >
                                                        Add Degree
                                                    </button>
                                                </div>
                                                <div className="flex flex-wrap gap-2.5 pt-2">
                                                    {formData.requiredDegreeField.map(degree => (
                                                        <div key={degree} className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-3 animate-in fade-in zoom-in duration-300">
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

                                            <div className="grid grid-cols-2 gap-10">
                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-3 cursor-pointer group mt-7 p-4 bg-slate-50 rounded-2xl border border-slate-200 hover:border-[#6366F1]/30 transition-all">
                                                        <div
                                                            onClick={() => setFormData(prev => ({ ...prev, isGpaMandatory: !prev.isGpaMandatory, minimumGPA: prev.isGpaMandatory ? '' : prev.minimumGPA }))}
                                                            className={`w-10 h-6 flex-shrink-0 rounded-full flex items-center p-1 transition-colors ${formData.isGpaMandatory ? 'bg-[#6366F1]' : 'bg-slate-300'}`}
                                                        >
                                                            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${formData.isGpaMandatory ? 'translate-x-4' : 'translate-x-0'}`} />
                                                        </div>
                                                        <div>
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 block">Require Minimum GPA</span>
                                                            <span className="text-[9px] font-semibold text-slate-400 uppercase">Make GPA mandatory</span>
                                                        </div>
                                                    </label>

                                                    {formData.isGpaMandatory && (
                                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                                            <CustomInput
                                                                label="Minimum GPA (Max 4.0)"
                                                                icon={GraduationCap}
                                                                name="minimumGPA"
                                                                value={formData.minimumGPA}
                                                                onChange={handleGpaChange}
                                                                type="number"
                                                                placeholder="e.g. 3.0"
                                                                step="0.01"
                                                                min="0"
                                                                max="4.0"
                                                                required
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                <CustomInput
                                                    label="Academic Standard"
                                                    icon={GraduationCap}
                                                    name="educationRequirements"
                                                    value={formData.educationRequirements}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g. Master's in Design"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-10">
                                                <CustomSelect
                                                    label="Seniority"
                                                    icon={Layers}
                                                    name="experienceLevel"
                                                    value={formData.experienceLevel}
                                                    onChange={handleInputChange}
                                                    options={experienceLevels}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {currentStep === 3 && (
                                        <div className="space-y-10">
                                            <div className="space-y-4">
                                                <label className="block text-xs font-black uppercase tracking-widest text-slate-900">Role Intelligence (Description)</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-[2rem] py-6 px-6 text-slate-900 font-bold h-44 resize-none"
                                                    required
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <CustomInput
                                                    label="MONTHLY STIPEND (RS)"
                                                    icon={Banknote}
                                                    type="number"
                                                    name="stipendAmount"
                                                    value={formData.stipendAmount}
                                                    onChange={handleStipendChange}
                                                    min="0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-rose-50 border border-rose-100 text-rose-500 p-6 rounded-2xl flex items-center gap-4 text-[10px] font-black uppercase">
                                        <AlertTriangle size={20} /> {error}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Footer */}
                        <div className="p-10 border-t border-slate-100 bg-white flex items-center justify-between shrink-0 relative z-20">
                            <button
                                onClick={prevStep}
                                className={`flex items-center gap-3 font-black uppercase text-[10px] tracking-[0.3em] px-8 py-5 rounded-2xl transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50'}`}
                            >
                                <ChevronLeft size={16} /> Previous
                            </button>

                            {currentStep < 3 ? (
                                <button
                                    onClick={nextStep}
                                    className="flex items-center gap-4 bg-[#6366F1] text-white font-black uppercase text-[11px] tracking-[0.3em] px-12 py-5 rounded-2xl hover:bg-[#4F46E5] shadow-lg"
                                >
                                    Continuum <ChevronRight size={16} />
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="flex items-center gap-5 bg-[#6366F1] text-white font-black uppercase text-sm tracking-[0.4em] px-16 py-6 rounded-3xl hover:bg-[#4F46E5] shadow-2xl disabled:opacity-50"
                                >
                                    {loading ? <Loader className="animate-spin" size={20} /> : <Zap size={24} fill="currentColor" />}
                                    Finalize Protocol
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Preview Column */}
                    <div className="w-5/12 bg-indigo-600 relative flex flex-col p-12 text-white overflow-hidden shadow-inner">
                        <header className="mb-0 opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Preview</p>
                        </header>
                        <div className="flex-1 flex flex-col justify-center">
                            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[3rem] p-10 space-y-8">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                                    <Building size={32} />
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{formData.position || 'Protocol Designer'}</h3>
                                    <p className="text-indigo-200 font-bold text-lg mt-2">{user?.companyName || 'Incubator'}</p>
                                </div>
                                <div className="flex gap-4">
                                    <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                                        {formData.locationType || 'Remote'}
                                        {formData.location && <span> | {formData.location}</span>}
                                    </div>
                                    <div className="bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/10">{formData.duration || '6M'}</div>
                                </div>
                                <div className="block border-t border-white/10 pt-6">
                                    <p className="text-white/60 text-sm leading-relaxed line-clamp-3 italic">
                                        {formData.description || 'Live transmission of role metadata will appear here...'}
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
        </div >
    );
};

export default EditInternshipPage;
