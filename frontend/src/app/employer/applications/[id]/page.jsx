'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, UserCircle, ExternalLink, CircleUserRound, GraduationCap, Mail, Phone, MapPin, IdCard } from 'lucide-react';
import axios from '@/services/apiClient';
import ApplicationDetailView from '@/components/application/ApplicationDetailView';
import InterviewModal from '@/components/application/InterviewModal';
import { PageLoader } from '@/components/common/Loader';
import Link from 'next/link';

const getBaseUrl = () => {
    const fallback = 'http://localhost:5000';
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || fallback;
    return apiUrl.replace(/\/api\/?$/, '');
};

const resolveAssetUrl = (assetPath) => {
    const rawPath = String(assetPath || '').trim();
    if (!rawPath) return '';
    if (/^https?:\/\//i.test(rawPath)) return rawPath;

    const normalizedPath = rawPath.replace(/\\/g, '/');
    const uploadsIndex = normalizedPath.toLowerCase().indexOf('/uploads/');

    if (uploadsIndex >= 0) {
        const publicPath = normalizedPath.slice(uploadsIndex).replace(/\/+/g, '/');
        return `${getBaseUrl()}${publicPath.startsWith('/') ? '' : '/'}${publicPath}`;
    }

    return `${getBaseUrl()}/${normalizedPath.replace(/^\/+/, '')}`;
};

/**
 * Employer Application Detail Page
 * 
 * Detailed view for employers to review candidates, inspect match data,
 * and advance applications through the pipeline.
 */
export default function EmployerApplicationDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [isEditingInterview, setIsEditingInterview] = useState(false);
    const [studentProfileSummary, setStudentProfileSummary] = useState({
        name: '',
        about: '',
        degree: '',
        email: '',
        phone: '',
        location: '',
        education: '',
        profileImage: ''
    });
    const [studentImageLoadFailed, setStudentImageLoadFailed] = useState(false);

    const getStatusControlClass = (status) => {
        const base = 'appearance-none text-white pl-7 pr-14 py-8 rounded-2xl font-black uppercase tracking-[0.22em] text-sm transition-all cursor-pointer disabled:opacity-50 shadow-lg';

        switch (status) {
            case 'Reviewing':
                return `${base} bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 shadow-amber-500/20`;
            case 'Shortlisted':
                return `${base} bg-gradient-to-r from-cyan-500 to-sky-600 hover:from-cyan-600 hover:to-sky-700 shadow-cyan-500/20`;
            case 'Interviewing':
                return `${base} bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-fuchsia-500/20`;
            case 'Offered':
                return `${base} bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 shadow-indigo-500/20`;
            case 'Accepted':
                return `${base} bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20`;
            case 'Rejected':
                return `${base} bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-rose-500/20`;
            case 'Applied':
            default:
                return `${base} bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-800 hover:to-slate-600 shadow-slate-500/20`;
        }
    };
    const [showInterviewModal, setShowInterviewModal] = useState(false);

    const statusOptions = [
        'Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered', 'Accepted', 'Rejected'
    ];

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const res = await axios.get(`/applications/${id}`);
                if (res.data.success) {
                    setApplication(res.data.data);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to sync with application node');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchApplication();
    }, [id]);

    useEffect(() => {
        const studentId = application?.student?._id;
        if (!studentId) return;

        const fetchStudentSummary = async () => {
            try {
                const res = await axios.get(`/auth/students/${studentId}`);
                const profile = res?.data?.data?.profile || {};
                const personal = profile?.personalInfo || {};
                const user = res?.data?.data?.user || {};
                const firstEducation = Array.isArray(profile?.education) ? profile.education[0] : null;
                const degreeValue = firstEducation
                    ? `${firstEducation.degree || ''}${firstEducation.field ? ` in ${firstEducation.field}` : ''}`.trim()
                    : '';
                const educationValue = firstEducation
                    ? `${firstEducation.degree || 'Education'}${firstEducation.field ? ` in ${firstEducation.field}` : ''}${firstEducation.institution ? ` • ${firstEducation.institution}` : ''}`.trim()
                    : '';
                const profileImage = user?.profilePicture || profile?.profileImage?.filePath || application?.student?.profilePicture || '';

                setStudentProfileSummary({
                    name: user?.name || personal?.fullName || application?.student?.name || '',
                    about: personal?.about || '',
                    degree: degreeValue,
                    email: user?.email || personal?.email || application?.student?.email || '',
                    phone: personal?.phone || '',
                    location: personal?.location || user?.location || '',
                    education: educationValue,
                    profileImage
                });
                setStudentImageLoadFailed(false);
            } catch (_) {
                setStudentProfileSummary({
                    name: application?.student?.name || '',
                    about: '',
                    degree: '',
                    email: application?.student?.email || '',
                    phone: '',
                    location: '',
                    education: '',
                    profileImage: application?.student?.profilePicture || ''
                });
            }
        };

        fetchStudentSummary();
    }, [application?.student?._id]);

    const handleStatusUpdate = async (newStatus, interviewDetails = null, editMode = false) => {
        if (newStatus === 'Interviewing' && !interviewDetails) {
            setIsEditingInterview(editMode || application?.status === 'Interviewing');
            setShowInterviewModal(true);
            return;
        }

        try {
            setUpdating(true);
            const payload = { 
                status: newStatus,
                comment: editMode ? 'Interview details were updated by employer.' : `Candidate moved to ${newStatus} phase.`
            };
            if (interviewDetails) payload.interviewDetails = interviewDetails;

            const res = await axios.patch(`/applications/${id}/status`, payload);
            if (res.data.success) {
                // Refresh data to show in history
                const updated = await axios.get(`/applications/${id}`);
                setApplication(updated.data.data);
                setShowInterviewModal(false);
                setIsEditingInterview(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Status update failed';
            alert(msg);
        } finally {
            setUpdating(false);
        }
    };

    const handleEditInterview = () => {
        setIsEditingInterview(true);
        setShowInterviewModal(true);
    };

    const isOptionDisabled = (opt) => {
        const statusOrder = ['Applied', 'Reviewing', 'Shortlisted', 'Interviewing', 'Offered', 'Accepted'];
        const current = application.status;
        const currentIndex = statusOrder.indexOf(current);
        
        // current status is selected but not clickable
        if (opt === current) return true;
        
        // Rejected is always available unless protocol is terminal
        if (opt === 'Rejected') {
            return current === 'Accepted' || current === 'Rejected';
        }

        // Only allow next sequential status
        const targetIndex = statusOrder.indexOf(opt);
        return targetIndex !== currentIndex + 1;
    };

    if (loading) return <PageLoader />;

    const studentImageUrl = resolveAssetUrl(studentProfileSummary.profileImage || application?.student?.profilePicture);
    const studentName = studentProfileSummary.name || application?.student?.name || 'Student';
    const studentEmail = studentProfileSummary.email || application?.student?.email || 'Email not available';

    if (error || !application) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center uppercase tracking-widest">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm max-w-md border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-4">Transmission Error</h2>
                    <p className="text-slate-500 font-bold mb-8 text-[10px]">The requested candidate protocol is unreachable or has been terminated.</p>
                    <Link href="/employer/applications" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20">
                        <ArrowLeft size={14} /> Open Applications
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Top Action Bar - Aligned with Header */}
            <div className="border-b border-slate-100 px-6 md:px-10 pt-5 pb-6 md:pt-6 md:pb-8">
                <div className="mx-auto max-w-6xl space-y-4">
                    <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <Link
                            href="/employer/applications"
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-indigo-200 hover:text-slate-900 shadow-sm self-start"
                        >
                            <ArrowLeft size={14} /> Back to Applications
                        </Link>
                    </div>

                    <div className="relative group">
                        <select 
                            value={application.status}
                            onChange={(e) => handleStatusUpdate(e.target.value)}
                            disabled={updating}
                            className={getStatusControlClass(application.status)}
                        >
                            {statusOptions.map(opt => (
                                <option 
                                    key={opt} 
                                    value={opt} 
                                    disabled={isOptionDisabled(opt)}
                                    className={application.status === opt ? "bg-slate-100 text-black font-bold" : "text-slate-500"}
                                >
                                    {opt} {application.status === opt ? '(Current)' : ''}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/90 pointer-events-none" />
                        {updating && <Loader2 size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />}
                    </div>
                </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-100/70 p-4 sm:p-5">
                        {application?.student?._id ? (
                            <Link
                                href={`/employer/students/${application.student._id}`}
                                className="group block rounded-3xl border border-slate-200 bg-white px-5 py-4 transition-all hover:border-indigo-200 hover:shadow-sm sm:px-6 sm:py-5"
                            >
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start min-w-0">
                                    {studentImageUrl && !studentImageLoadFailed ? (
                                        <img
                                            src={studentImageUrl}
                                            alt={`${application?.student?.name || 'Student'} profile`}
                                            className="h-20 w-20 shrink-0 rounded-3xl border border-slate-200 object-cover shadow-sm"
                                            onError={() => setStudentImageLoadFailed(true)}
                                        />
                                    ) : (
                                        <div className="h-20 w-20 shrink-0 rounded-3xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                                            <UserCircle size={28} />
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                                            <div className="min-w-0">
                                                <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase truncate">
                                                    {studentName}
                                                </h2>
                                                <p className="text-xl font-semibold text-slate-500 truncate">
                                                    {studentEmail}
                                                </p>
                                            </div>
                                            <p className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-700 group-hover:text-indigo-900 self-start">
                                                View Full Profile <ExternalLink size={12} />
                                            </p>
                                        </div>

                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Name</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{studentName}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                        <CircleUserRound size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">About</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{studentProfileSummary.about || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Email</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-all">{studentEmail}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Phone</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{studentProfileSummary.phone || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{studentProfileSummary.location || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                                        <GraduationCap size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Education</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-words">{studentProfileSummary.education || studentProfileSummary.degree || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 sm:px-6 sm:py-5">
                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start min-w-0">
                                    <div className="h-20 w-20 shrink-0 rounded-3xl border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                                        <UserCircle size={28} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase truncate">
                                            {application?.student?.name || 'Student'}
                                        </h2>
                                        <p className="text-xl font-semibold text-slate-500 truncate">
                                            {application?.student?.email || 'Email not available'}
                                        </p>
                                        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Name</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800">{application?.student?.name || 'Student'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                                                        <CircleUserRound size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">About</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800">Not provided</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Email</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800 break-all">{application?.student?.email || 'Email not available'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fuchsia-100 text-fuchsia-700">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Phone</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800">Not provided</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                                                        <MapPin size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800">Not provided</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700">
                                                        <GraduationCap size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-500">Education</p>
                                                        <p className="mt-1 text-sm font-semibold text-slate-800">Not provided</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="p-6 lg:p-12">
                <div className="max-w-6xl mx-auto space-y-8">
                    <InterviewModal 
                        isOpen={showInterviewModal}
                        onClose={() => {
                            setShowInterviewModal(false);
                            setIsEditingInterview(false);
                        }}
                        onConfirm={(details) => handleStatusUpdate('Interviewing', details, isEditingInterview)}
                        application={application}
                        initialDetails={isEditingInterview ? application?.interviewDetails : null}
                        title={isEditingInterview ? 'Edit Interview Details' : 'Schedule Interview'}
                        confirmLabel={isEditingInterview ? 'Save Changes' : 'Confirm Interview'}
                    />

                    <ApplicationDetailView 
                        application={application} 
                        role="employer"
                        onStatusUpdate={handleEditInterview}
                    />
                </div>
            </div>
        </div>
    );
}
