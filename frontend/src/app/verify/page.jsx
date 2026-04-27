'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    Upload, 
    CheckCircle, 
    AlertCircle, 
    ArrowRight, 
    FileText, 
    Building, 
    User, 
    Loader2,
    Lock
} from 'lucide-react';

export default function VerificationPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [step, setStep] = useState(1);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form States
    const [file, setFile] = useState(null);
    const [formData, setFormData] = useState({
        studentId: '',
        companyName: '',
        businessRegistrationNumber: '',
        website: ''
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
        }
    }, [user, authLoading, router]);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setUploading(true);

        const apiPayload = new FormData();
        apiPayload.append(user.role === 'student' ? 'studentIdImage' : 'businessDocument', file);
        
        if (user.role === 'student') {
            apiPayload.append('studentId', formData.studentId);
        } else {
            apiPayload.append('companyName', formData.companyName);
            apiPayload.append('businessRegistrationNumber', formData.businessRegistrationNumber);
            apiPayload.append('website', formData.website);
        }

        try {
            const endpoint = user.role === 'student' ? '/verification/student' : '/verification/employer';
            await axios.post(endpoint, apiPayload, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => {
                const dashboard = user.role === 'employer' ? '/employer/dashboard' : '/student-dashboard';
                router.push(dashboard);
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    if (authLoading || !user) return null;

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-60"></div>
            </div>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-xl bg-white/70 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl shadow-indigo-200/50 p-10 border border-white relative z-10"
            >
                <div className="flex justify-center mb-8">
                    <div className="p-4 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/30">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                </div>

                {success ? (
                    <div className="text-center space-y-6">
                        <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="flex justify-center">
                            <CheckCircle className="text-emerald-500 w-20 h-20" />
                        </motion.div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Documents Received</h1>
                        <p className="text-slate-500 font-medium">Your verification is now pending. You'll be redirected to your dashboard in a moment.</p>
                        <div className="flex items-center justify-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest">
                            <Loader2 className="w-3 h-3 animate-spin" /> Finalizing Connection...
                        </div>
                    </div>
                ) : (
                    <>
                        <header className="text-center mb-10">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <Lock className="w-3 h-3 text-indigo-600" />
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Secure Onboarding</span>
                            </div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Verify Your Identity</h1>
                            <p className="text-slate-500 font-medium">To keep InternMatch safe, we require all {user.role}s to verify their information.</p>
                        </header>

                        {error && (
                            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold">
                                <AlertCircle size={18} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {user.role === 'student' ? (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Student ID Number</label>
                                        <input 
                                            name="studentId"
                                            required
                                            value={formData.studentId}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all"
                                            placeholder="e.g. STU-2023-001"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Company Legal Name</label>
                                        <input 
                                            name="companyName"
                                            required
                                            value={formData.companyName}
                                            onChange={handleInputChange}
                                            className="w-full px-5 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all"
                                            placeholder="e.g. Acme Innovations Ltd."
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Reg. Number</label>
                                            <input 
                                                name="businessRegistrationNumber"
                                                required
                                                value={formData.businessRegistrationNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all"
                                                placeholder="BRN-9921"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">Website</label>
                                            <input 
                                                name="website"
                                                value={formData.website}
                                                onChange={handleInputChange}
                                                className="w-full px-5 py-4 bg-slate-100/50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none font-bold text-slate-700 transition-all"
                                                placeholder="https://..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* File Upload Area */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider ml-1">
                                    {user.role === 'student' ? 'Upload Student ID (Photo)' : 'Business Incorporation Certificate'}
                                </label>
                                <div className={`relative group border-2 border-dashed rounded-3xl p-8 transition-all ${file ? 'border-emerald-300 bg-emerald-50/30' : 'border-slate-200 bg-slate-100/30 hover:border-indigo-300 hover:bg-slate-50'}`}>
                                    <input 
                                        type="file" 
                                        required
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        accept="image/*,application/pdf"
                                    />
                                    <div className="text-center">
                                        <div className={`mx-auto w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${file ? 'bg-emerald-500' : 'bg-slate-200 text-slate-500 group-hover:bg-indigo-500 group-hover:text-white'}`}>
                                            {file ? <CheckCircle className="text-white" /> : <Upload />}
                                        </div>
                                        {file ? (
                                            <p className="text-sm font-bold text-emerald-600 truncate">{file.name}</p>
                                        ) : (
                                            <>
                                                <p className="text-sm font-bold text-slate-700">Drag or click to upload</p>
                                                <p className="text-[10px] text-slate-500 font-medium">Max 5MB (PDF, PNG, JPG)</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4 flex flex-col gap-4">
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-black transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {uploading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" /> Fastening Encryption...
                                        </>
                                    ) : (
                                        <>
                                            Submit for Review <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                                
                                <button 
                                    type="button"
                                    onClick={() => router.push(user.role === 'employer' ? '/employer/dashboard' : '/student-dashboard')}
                                    className="text-[10px] text-slate-500 font-black uppercase tracking-widest hover:text-indigo-600 transition-colors"
                                >
                                    Skip for now (Limited access)
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <ShieldCheck size={14} className="text-emerald-500" /> AES-256 Encrypted
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                <Lock size={14} className="text-indigo-500" /> GDPR Compliant
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
}
