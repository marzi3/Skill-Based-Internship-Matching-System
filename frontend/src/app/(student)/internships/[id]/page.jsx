'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import axios from '@/services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Building, MapPin, Clock, Calendar,
    GraduationCap, Briefcase, Banknote, Star,
    CheckCircle2, AlertTriangle, XCircle, ChevronRight, Check, Loader2
} from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/common/Loader';

export default function InternshipDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [internship, setInternship] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applied, setApplied] = useState(false);
    const [applying, setApplying] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);

                // 1. Fetch Job Details
                const jobRes = await axios.get(`/internships/${id}`);
                if (!jobRes.data.success) throw new Error('Failed to load internship details');
                setInternship(jobRes.data.data);

                // 2. Fetch Match Analysis
                const matchRes = await axios.get(`/matching/explain/${user._id}/${id}`);
                if (matchRes.data.success) {
                    setAnalysis(matchRes.data.analysis);
                }

                // 3. Check if already applied (logic can be added here or in backend)

            } catch (err) {
                console.error(err);
                setError(err.message || 'Error communicating with server');
            } finally {
                setLoading(false);
            }
        };

        if (id && user?._id) {
            fetchDetails();
        }
    }, [id, user?._id]);

    const handleApply = async () => {
        try {
            setApplying(true);
            const res = await axios.post(`/applications/apply/${id}`);
            if (res.data.success) {
                setApplied(true);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <PageLoader />;

    if (error || !internship) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-8">
                <div className="bg-white p-12 rounded-[3rem] text-center max-w-lg shadow-sm">
                    <AlertTriangle className="mx-auto w-16 h-16 text-rose-500 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900 mb-4">Transmission Error</h2>
                    <p className="text-slate-500 font-bold mb-8">{error || "Internship not found."}</p>
                    <Link href="/internships" className="inline-flex items-center gap-2 bg-[#6366F1] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-[#4F46E5] transition-all">
                        <ArrowLeft size={16} /> Return to Search
                    </Link>
                </div>
            </div>
        );
    }

    const { tier, normalizedScore, explanation } = analysis || {};
    const isDisqualified = tier === 'DISQUALIFIED';

    // Skill Gap Analysis
    const userSkillNames = (user.skills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
    const missingSkills = (internship.requiredSkills || [])
        .filter(reqSkill => {
            const reqName = typeof reqSkill === 'string' ? reqSkill : reqSkill.name;
            return !userSkillNames.includes(reqName.toLowerCase());
        })
        .map(reqSkill => typeof reqSkill === 'string' ? { name: reqSkill, mandatory: false } : reqSkill);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-sans font-medium text-slate-600">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Back Button */}
                <Link href="/find-internships" className="inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest">
                    <ArrowLeft size={16} /> Back to Search
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Job Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Card */}
                        <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                        <Building className="text-[#6366F1]" size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black tracking-[0.3em] uppercase text-[#6366F1] mb-1">
                                            {internship.employer?.companyName || internship.company || 'Industrial Partner'}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-400" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{internship.workEnvironment || 'Remote'}</span>
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                                    {internship.positionTitle}
                                </h1>

                                <div className="flex flex-wrap gap-4 mb-10">
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Clock size={16} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{internship.duration || '6'} Months</span>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Banknote size={16} className="text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">INR {internship.stipend?.amount || '0'}</span>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Briefcase size={16} className="text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{internship.experienceLevel || 'Entry Level'}</span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-4">Mission Overview</h3>
                                        <p className="text-slate-600 font-medium leading-relaxed whitespace-pre-line">
                                            {internship.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Required Stack */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Required Technology Stack</h3>
                            <div className="flex flex-wrap gap-3">
                                {(internship.requiredSkills || []).map((skill, i) => {
                                    const name = typeof skill === 'string' ? skill : skill.name;
                                    const isMandatory = typeof skill === 'object' && skill.mandatory;
                                    return (
                                        <div key={i} className="px-5 py-3 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                            {name}
                                            {isMandatory && <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" title="Mandatory" />}
                                        </div>
                                    );
                                })}
                            </div>

                            {internship.preferredSkills?.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-slate-100">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Preferred / Bonus Skills</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {internship.preferredSkills.map((skill, i) => (
                                            <div key={i} className="px-5 py-3 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                                {skill}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Match Analysis & Action */}
                    <div className="lg:col-span-4 space-y-8">

                        {/* Match Analysis Engine Widget */}
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />

                            <div className="relative z-10 space-y-8">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                                        <Star size={16} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-300">Match Intelligence</span>
                                </div>

                                <div className="flex items-end gap-3 text-white">
                                    <span className="text-7xl font-black tracking-tighter leading-none">{normalizedScore || 0}</span>
                                    <span className="text-lg font-bold text-slate-400 mb-1 tracking-widest uppercase">/ 100</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-400">Match Tier</span>
                                        <span className={`${isDisqualified ? 'text-rose-400' :
                                            tier === 'EXCELLENT' ? 'text-emerald-400' :
                                                tier === 'GOOD' ? 'text-indigo-400' : 'text-amber-400'
                                            }`}>{tier || 'UNKNOWN'}</span>
                                    </div>
                                    {/* Score Bar */}
                                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${normalizedScore || 0}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className={`h-full rounded-full ${isDisqualified ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
                                        />
                                    </div>
                                </div>

                                {/* Rule Breakdown */}
                                {analysis?.explanation && analysis.explanation.length > 0 && (
                                    <div className="pt-6 border-t border-white/10 space-y-4">
                                        <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Evaluation Log</h4>
                                        <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar-light pr-2">
                                            {analysis.explanation.map((item, i) => (
                                                <div key={i} className="flex gap-3 text-[10px] font-bold">
                                                    <div>
                                                        {item.score === -Infinity ? (
                                                            <XCircle size={14} className="text-rose-500 shrink-0" />
                                                        ) : item.score > 0 ? (
                                                            <div className="w-3.5 h-3.5 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center text-[8px] shrink-0 mt-0.5">+{item.score}</div>
                                                        ) : (
                                                            <div className="w-3.5 h-3.5 bg-rose-500/20 text-rose-400 rounded-md flex items-center justify-center text-[8px] shrink-0 mt-0.5">{item.score}</div>
                                                        )}
                                                    </div>
                                                    <p className="text-slate-300 leading-snug">{item.detail}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Skill Gap Analysis Box (Only if Skills Missing) */}
                        {missingSkills.length > 0 && (
                            <div className="bg-amber-50 rounded-[2.5rem] p-8 border border-amber-200">
                                <div className="flex items-center gap-3 mb-6">
                                    <AlertTriangle size={20} className="text-amber-500" />
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-900">Skill Gap Detected</h3>
                                </div>
                                <p className="text-xs font-bold text-amber-700/80 mb-6 leading-relaxed">
                                    Complete these <strong className="text-amber-900">{missingSkills.length} skills</strong> to boost your match score. Missing mandatory elements will trigger disqualification.
                                </p>
                                <div className="space-y-3">
                                    {missingSkills.map((skill, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-amber-200/50">
                                            <span className="text-[10px] font-black text-amber-900 uppercase tracking-widest">{skill.name}</span>
                                            {skill.mandatory && (
                                                <span className="text-[8px] font-black text-rose-600 bg-rose-100 px-2 py-1 rounded-lg uppercase tracking-widest">Mandatory</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Apply Action Widget */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                            {isDisqualified ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <XCircle className="text-rose-500" size={28} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Application Blocked</h4>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                        Your profile does not meet the mandatory criteria for this protocol. Review the evaluation log above.
                                    </p>
                                    <button disabled className="w-full mt-4 bg-slate-100 text-slate-400 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl cursor-not-allowed">
                                        Apply Action Locked
                                    </button>
                                </div>
                            ) : applied ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="text-emerald-500" size={28} />
                                    </div>
                                    <h4 className="text-sm font-black text-emerald-900 uppercase tracking-widest">Applied Successfully</h4>
                                    <p className="text-xs font-bold text-emerald-700 leading-relaxed">
                                        Your credentials have been submitted. The industrial partner will review your protocol shortly.
                                    </p>
                                    <Link href="/student/applications" className="block text-center text-[10px] font-black text-[#6366F1] uppercase tracking-widest hover:underline mt-4">
                                        View All Applications
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={handleApply}
                                    disabled={applying}
                                    className="w-full group bg-[#6366F1] text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#4F46E5] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {applying ? (
                                        <Loader2 className="animate-spin" size={16} />
                                    ) : (
                                        <>Initialize Application <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
                                    )}
                                </button>
                            )}
                        </div>

                    </div>
                </div>
            </div>

            <style jsx global>{`
                .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
