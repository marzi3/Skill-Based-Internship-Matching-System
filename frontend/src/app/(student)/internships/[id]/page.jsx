'use client';

import { useState, useEffect, use } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/services/apiClient';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Building, MapPin, Clock, Calendar,
    GraduationCap, Briefcase, Banknote, Star,
    CheckCircle2, AlertTriangle, XCircle, ChevronRight, Check, Loader2, MessageSquare
} from 'lucide-react';
import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';
import { PageLoader } from '@/components/common/Loader';
import ReportModal from '@/components/modals/ReportModal';
import SubmitApplicationModal from '@/components/modals/SubmitApplicationModal';

const decodeHtmlEntities = (value = '') => {
    const input = String(value);
    return input
        .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'");
};

export default function InternshipDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user } = useAuth();
    // Determine back navigation context
    const fromParam = searchParams.get('from');
    const backHref = fromParam === 'search' ? '/find-internships' : '/student-dashboard';
    const backLabel = fromParam === 'search' ? 'Back to Search' : 'Back to Dashboard';

    const [internship, setInternship] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applied, setApplied] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [applying, setApplying] = useState(false);
    const [showReport, setShowReport] = useState(false);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [submittedAppId, setSubmittedAppId] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [resendingVerification, setResendingVerification] = useState(false);
    const [withdrawing, setWithdrawing] = useState(false);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!user?._id) return;
            try {
                setLoading(true);

                // 1. Fetch Job Details
                const jobRes = await axios.get(`internships/${id}`);
                if (!jobRes.data.success) throw new Error('Failed to load internship details');
                setInternship(jobRes.data.data);

                // 2. Fetch Match Analysis & Application Status (Student-only Intelligence)
                if (user?.role === 'student') {
                    const matchRes = await axios.get(`matching/explain/${user._id}/${id}`);
                    if (matchRes.data.success) {
                        setAnalysis(matchRes.data.analysis);
                    }

                    const checkRes = await axios.get(`applications/check/${id}`);
                    if (checkRes.data.success) {
                        const { applied: isApplied, applicationId, applicationStatus: appStatus } = checkRes.data;
                        setApplied(isApplied);
                        setApplicationStatus(appStatus);
                        if (applicationId) setSubmittedAppId(applicationId);
                    }

                    const profileRes = await axios.get('students/profile');
                    if (profileRes.data.success) {
                        setStudentProfile(profileRes.data.data);
                    }
                }

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

    const handleApply = async (coverLetter) => {
        try {
            setApplying(true);
            const res = await axios.post(`applications/apply/${id}`, {
                coverLetter
            });
            if (res.data.success) {
                setApplied(true);
                setApplicationStatus(res.data.data.status || 'Applied');
                setSubmittedAppId(res.data.data._id);
                setShowApplyModal(false);
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to submit application');
        } finally {
            setApplying(false);
        }
    };

    const handleResendVerification = async () => {
        try {
            setResendingVerification(true);
            const res = await axios.post('auth/resend-verification');
            if (res.data?.verificationUrl) {
                window.location.href = res.data.verificationUrl;
                return;
            }
            alert(res.data?.message || 'Verification email sent. Please check your inbox.');
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resend verification email');
        } finally {
            setResendingVerification(false);
        }
    };

    const handleWithdraw = async () => {
        if (!submittedAppId) return;
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;

        try {
            setWithdrawing(true);
            const res = await axios.delete(`/applications/${submittedAppId}/withdraw`);
            if (res.data?.success) {
                setApplied(false);
                setApplicationStatus('Withdrawn');
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to withdraw application');
        } finally {
            setWithdrawing(false);
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

    // Derive matched skill names from the engine's explanation log (reliable source of truth)
    // The engine emits "Exact skill match: X" for every skill it found in the student's profile.
    const matchedSkillNames = new Set(
        (analysis?.explanation || [])
            .filter(e => e.detail?.startsWith('Exact skill match:'))
            .map(e => e.detail.replace('Exact skill match: ', '').trim().toLowerCase())
    );

    // Only flag as missing if the engine did NOT find a match for it
    const missingSkills = (internship.requiredSkills || [])
        .filter(reqSkill => {
            const reqName = (typeof reqSkill === 'string' ? reqSkill : reqSkill.name).toLowerCase();
            return !matchedSkillNames.has(reqName);
        })
        .map(reqSkill => typeof reqSkill === 'string' ? { name: reqSkill, mandatory: false } : reqSkill);

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12 font-sans font-medium text-slate-600">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header Back Button */}
                <Link href={backHref} className="inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest">
                    <ArrowLeft size={16} /> {backLabel}
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Job Details */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Card */}
                        <div className="bg-white rounded-[3rem] p-10 lg:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-60" />

                            <div className="relative z-10">
                                <div className="flex items-center gap-4 mb-8">
                                    <Link href={`/employers/${internship.employer?._id || internship.employerId}`} className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner overflow-hidden group">
                                        {internship.employer?.profilePicture ? (
                                            <img 
                                                src={internship.employer.profilePicture.startsWith('http') ? internship.employer.profilePicture : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${internship.employer.profilePicture}`} 
                                                alt={internship.employer?.companyName} 
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            />
                                        ) : (
                                            <Building className="text-[#6366F1]" size={28} />
                                        )}
                                    </Link>
                                    <div>
                                        <Link href={`/employers/${internship.employer?._id || internship.employerId}`} className="text-[10px] font-black tracking-[0.3em] uppercase text-[#6366F1] mb-1 hover:text-[#4F46E5] transition-colors">
                                            {internship.employer?.companyName || internship.company || 'Industrial Partner'}
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <MapPin size={14} className="text-slate-500" />
                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{internship.workEnvironment || 'Remote'}</span>
                                        </div>
                                    </div>
                                </div>

                                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
                                    {decodeHtmlEntities(internship.positionTitle)}
                                </h1>

                                <div className="flex flex-wrap gap-4 mb-10">
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Clock size={16} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{internship.duration || '6'} Months</span>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Banknote size={16} className="text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">LKR {internship.stipend?.amount || '0'}</span>
                                    </div>
                                    <div className="px-5 py-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                                        <Briefcase size={16} className="text-indigo-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{internship.experienceLevel || 'Entry Level'}</span>
                                    </div>
                                </div>

                                <div className="mt-2 rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 sm:p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-sm">
                                            <MessageSquare size={18} />
                                        </div>
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.35em] text-slate-600">Mission Overview</h3>
                                    </div>
                                    <p className="text-slate-700 text-[15px] sm:text-[16px] leading-8 whitespace-pre-line font-medium">
                                        {internship.description}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Required Stack */}
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Required Technology Stack</h3>
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
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Preferred / Bonus Skills</h3>
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
                                    <button disabled className="w-full mt-4 bg-slate-100 text-slate-500 font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl cursor-not-allowed">
                                        Apply Action Locked
                                    </button>
                                </div>
                            ) : applied ? (
                                <div className="space-y-4">
                                    <button
                                        type="button"
                                        onClick={handleWithdraw}
                                        disabled={withdrawing}
                                        className="w-full py-4 bg-white text-rose-600 border border-rose-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                                    >
                                        {withdrawing ? 'Withdrawing...' : 'Withdraw Application'}
                                    </button>
                                    <Link href={`/applications/${submittedAppId}`} className="block w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] text-center shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
                                        View Application Details
                                    </Link>
                                    <div className="bg-gradient-to-br from-emerald-50 via-white to-cyan-50 border border-emerald-100 rounded-[2rem] p-8 text-center shadow-sm">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 border border-emerald-100">
                                            <CheckCircle2 size={32} className="text-emerald-500" />
                                        </div>
                                        <span className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black uppercase tracking-widest">
                                            Active Application
                                        </span>
                                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Application submitted successfully</h3>
                                        <p className="text-slate-500 font-bold text-sm">Your application has been sent to the employer. You can withdraw before final decision if needed.</p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Note</p>
                                        <p className="text-xs font-bold text-amber-700/90 mt-1">Withdrawing will mark this application as withdrawn. You can apply again later.</p>
                                    </div>
                                </div>
                            ) : applicationStatus === 'Withdrawn' ? (
                                <div className="space-y-4">
                                    <div className="bg-amber-50 border border-amber-100 rounded-[2rem] p-8 text-center">
                                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4">
                                            <XCircle size={32} className="text-amber-500" />
                                        </div>
                                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Application Withdrawn</h3>
                                        <p className="text-slate-500 font-bold text-sm">You have withdrawn this application. You can apply again below.</p>
                                    </div>
                                    <button
                                        onClick={() => setShowApplyModal(true)}
                                        disabled={applying}
                                        className="w-full group bg-[#6366F1] text-white py-5 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] hover:bg-[#4F46E5] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {applying ? <Loader2 className="animate-spin" size={16} /> : <>Apply Again <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" /></>}
                                    </button>
                                </div>
                            ) : (user?.isVerified === false) ? (
                                <div className="text-center space-y-4">
                                    <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertTriangle className="text-amber-500" size={28} />
                                    </div>
                                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Verification Required</h4>
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed">
                                        Please verify your email address to continue.
                                    </p>
                                    <button
                                        onClick={handleResendVerification}
                                        disabled={resendingVerification}
                                        className="w-full mt-4 bg-amber-500 text-white font-black uppercase tracking-widest text-[10px] py-5 rounded-2xl hover:bg-amber-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {resendingVerification ? <Loader2 className="animate-spin" size={16} /> : null}
                                        {resendingVerification ? 'Sending Verification...' : 'Resend Verification Email'}
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowApplyModal(true)}
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
                                    <span className="text-lg font-bold text-slate-500 mb-1 tracking-widest uppercase">/ 100</span>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-slate-500">Match Tier</span>
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

                                {/* Match Summary Paragraph */}
                                <div className="pt-2">
                                    <p className="text-xs font-bold text-slate-500 leading-relaxed italic">
                                        {tier === 'EXCELLENT' ? (
                                            "Your profile is a near-perfect synchronization with this protocol's requirements. High technical overlap and credential verification confirmed."
                                        ) : tier === 'GOOD' ? (
                                            "You have a strong foundation for this role. Minor skill gaps or preference mismatches detected, but overall compatibility is high."
                                        ) : tier === 'FAIR' ? (
                                            "Your profile meets basic requirements, but significant skill development or profile enhancement is recommended for a competitive edge."
                                        ) : isDisqualified ? (
                                            "Critical mismatch detected. Mandatory synchronization requirements (skills or GPA) have not been verified in your current profile."
                                        ) : (
                                            "Profile analysis complete. Review the technical breakdown below for specific matching factors."
                                        )}
                                    </p>
                                </div>

                                {/* Rule Breakdown */}
                                {analysis?.explanation && analysis.explanation.length > 0 && (
                                    <div className="pt-6 border-t border-white/10 space-y-6">
                                        <div className="space-y-4">
                                            <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500">Technical Strengths</h4>
                                            <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar-light pr-2">
                                                {analysis.explanation.filter(item => item.score > 0).map((item, i) => (
                                                    <div key={i} className="flex gap-3 text-[10px] font-bold">
                                                        <div className="w-3.5 h-3.5 bg-emerald-500/20 text-emerald-400 rounded-md flex items-center justify-center text-[8px] shrink-0 mt-0.5">+{item.score}</div>
                                                        <p className="text-slate-500 leading-snug">{item.detail}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {analysis.explanation.some(item => item.score <= 0) && (
                                            <div className="space-y-4">
                                                <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-rose-500">Optimization Gaps</h4>
                                                <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar-light pr-2">
                                                    {analysis.explanation.filter(item => item.score <= 0).map((item, i) => (
                                                        <div key={i} className="flex gap-3 text-[10px] font-bold">
                                                            {item.score === -Infinity ? (
                                                                <XCircle size={14} className="text-rose-500 shrink-0" />
                                                            ) : (
                                                                <div className="w-3.5 h-3.5 bg-rose-500/20 text-rose-400 rounded-md flex items-center justify-center text-[8px] shrink-0 mt-0.5">{item.score}</div>
                                                            )}
                                                            <p className="text-slate-500 leading-snug">{item.detail}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
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

                        {/* Report Button (Secondary) */}
                        <div className="pt-2">
                            <button 
                                onClick={() => setShowReport(true)}
                                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-rose-500 transition-colors group py-4 bg-white/50 border border-transparent hover:border-rose-100 rounded-2xl"
                            >
                                <AlertTriangle size={14} className="group-hover:scale-110 transition-transform" />
                                Report this Listing
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <ReportModal 
                isOpen={showReport}
                onClose={() => setShowReport(false)}
                reportedId={id}
                reportedEntity="Internship"
                reportedName={internship.positionTitle}
            />

            <SubmitApplicationModal
                isOpen={showApplyModal}
                onClose={() => setShowApplyModal(false)}
                onSubmit={handleApply}
                internship={internship}
                analysis={analysis}
            />

            <style jsx global>{`
                .custom-scrollbar-light::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar-light::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar-light::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
            `}</style>
        </div>
    );
}
