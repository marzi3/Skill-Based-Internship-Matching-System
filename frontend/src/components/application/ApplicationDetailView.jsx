'use client';

import {
    AlertTriangle,
    Building,
    Calendar,
    Check,
    CheckCircle2,
    Clock,
    FileText,
    ArrowLeft,
    Globe,
    Mail,
    MapPin,
    Pencil,
    Phone,
    User,
} from 'lucide-react';
import Link from 'next/link';

/**
 * ApplicationDetailView
 *
 * Compact protocol-style detail view for an application's lifecycle.
 */
export default function ApplicationDetailView({ application, role, onStatusUpdate, onWithdraw }) {
    if (!application) return null;

    const {
        internship,
        student,
        employer,
        matchAnalysis,
        statusHistory,
        status,
        coverLetter,
        appliedDate,
        interviewDetails
    } = application;

    const baseTimelineSteps = [
        { id: 'Applied', label: 'Submitted', description: 'Application submitted' },
        { id: 'Reviewing', label: 'Under Review', description: 'Employer evaluation in progress' },
        { id: 'Shortlisted', label: 'Shortlisted', description: 'Candidate moved to next round' },
        { id: 'Interviewing', label: 'Interview', description: 'Meeting scheduled with candidate' },
        { id: 'Offered', label: 'Offered', description: 'Official internship offer sent' }
    ];

    const terminalStep =
        status === 'Rejected'
            ? { id: 'Rejected', label: 'Rejected', description: 'Application was rejected' }
            : status === 'Withdrawn'
                ? { id: 'Withdrawn', label: 'Withdrawn', description: 'Application was withdrawn' }
                : { id: 'Accepted', label: 'Accepted', description: 'Candidate accepted the position' };

    const timelineSteps = [...baseTimelineSteps, terminalStep];

    const currentStepIndex = timelineSteps.findIndex((step) => step.id === status);
    const orderedStatusHistory = [...(statusHistory || [])].sort((a, b) => new Date(a.updatedAt) - new Date(b.updatedAt));
    const crossedStageIds = new Set(
        orderedStatusHistory
            .map((log) => log.status)
            .filter((statusValue) => timelineSteps.some((step) => step.id === statusValue))
    );
    crossedStageIds.add('Applied');
    if (timelineSteps.some((step) => step.id === status)) {
        crossedStageIds.add(status);
    }
    const score = Math.max(0, Math.min(100, Number(matchAnalysis?.score || application.matchScore || 0)));
    const radius = 30;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (score / 100) * circumference;

    const isRejected = status === 'Rejected';
    const isWithdrawn = status === 'Withdrawn';

    const positiveSignals = (matchAnalysis?.explanation || []).filter((item) => item.score > 0);
    const verifiedStrengthsLeft = positiveSignals.slice(0, 5);
    const verifiedStrengthsRight = positiveSignals.slice(5);
    const negativeSignals = (matchAnalysis?.explanation || []).filter((item) => item.score <= 0);
    const latestStatusLog = [...(statusHistory || [])]
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];
    const currentStepLabel = timelineSteps.find((step) => step.id === status)?.label || status || 'Unknown';

    const formatInterviewTime = (value) => {
        if (!value) return 'To be confirmed';

        const raw = String(value).trim();
        if (/\b(am|pm)\b/i.test(raw)) return raw.toUpperCase();

        const match = raw.match(/^(\d{1,2}):(\d{2})$/);
        if (!match) return raw;

        let hours = Number(match[1]);
        const minutes = match[2];
        const suffix = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        return `${hours}:${minutes} ${suffix}`;
    };

    const getStatusChipClass = (statusValue) => {
        if (statusValue === 'Applied') return 'bg-indigo-100 text-indigo-700';
        if (statusValue === 'Rejected' || statusValue === 'Withdrawn') return 'bg-rose-100 text-rose-700';
        if (statusValue === 'Interviewing') return 'bg-sky-100 text-sky-700';
        if (statusValue === 'Offered') return 'bg-amber-100 text-amber-700';
        return 'bg-emerald-100 text-emerald-700';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#d8e5f2] via-[#e8edf4] to-[#eef2f7] p-4 sm:p-6 lg:p-10">
            <div className="mx-auto max-w-6xl space-y-4">
                <div className="rounded-[1.8rem] border border-slate-200 bg-white shadow-[0_24px_50px_rgba(15,23,42,0.12)]">
                    <div className="border-b border-slate-200 px-5 py-5 sm:px-8">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                    <Building size={12} className="text-indigo-600" />
                                    <span>{internship?.company || employer?.companyName || 'Industrial Partner'}</span>
                                    <span className="rounded-md bg-indigo-50 px-2 py-1 text-indigo-600">Sri Lanka</span>
                                </div>
                                <h1 className="text-3xl font-black leading-tight text-slate-900 sm:text-5xl">{internship?.positionTitle}</h1>
                                <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">Internship period: {internship?.duration || 'Unknown'} months</span>
                                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700">Status: active</span>
                                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-600">Applied {new Date(appliedDate).toLocaleDateString()}</span>
                                </div>
                                <div className="relative mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/90 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                                    <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-500 via-cyan-400 to-emerald-400" />
                                    <div className="pl-4">
                                        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                            Cover Letter Snapshot
                                        </p>
                                        <p className="text-base italic leading-relaxed text-slate-700">
                                            “{coverLetter || 'No cover letter was provided with this submission.'}”
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="relative overflow-hidden bg-slate-50 px-5 py-5" style={{ clipPath: 'polygon(4% 0, 100% 0, 96% 88%, 0 100%)' }}>
                                <div className="absolute inset-0 border border-slate-200" style={{ clipPath: 'polygon(4% 0, 100% 0, 96% 88%, 0 100%)' }} />
                                <div className="absolute -right-8 -top-10 h-24 w-24 rounded-full bg-indigo-100/70 blur-2xl" />
                                <div className="relative z-10">
                                    <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Match Intelligence</p>
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-20 w-20">
                                            <svg viewBox="0 0 80 80" className="h-20 w-20">
                                                <circle cx="40" cy="40" r={radius} fill="none" stroke="#dbe7f2" strokeWidth="7" />
                                                <circle
                                                    cx="40"
                                                    cy="40"
                                                    r={radius}
                                                    fill="none"
                                                    stroke="#2563eb"
                                                    strokeWidth="7"
                                                    strokeLinecap="round"
                                                    strokeDasharray={circumference}
                                                    strokeDashoffset={strokeOffset}
                                                    transform="rotate(-90 40 40)"
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-slate-900">{score}</span>
                                        </div>
                                        <div className="space-y-1 text-right">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">/100</p>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${matchAnalysis?.tier === 'DISQUALIFIED' ? 'text-rose-600' : 'text-amber-600'}`}>
                                                {matchAnalysis?.tier || 'N/A'} tier
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6 px-5 py-5 sm:px-8 sm:py-6">
                                <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-700">Protocol Pipeline Progress</h3>
                                        <p className="text-[11px] font-bold text-slate-600">
                                            Current: {currentStepLabel} - last update:{' '}
                                            {latestStatusLog ? new Date(latestStatusLog.updatedAt).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>

                                    <div className="overflow-x-auto pb-1">
                                        <div className="min-w-[720px]">
                                            <div className="flex items-start">
                                        {timelineSteps.map((step, index) => {
                                            const isCurrent = step.id === status;
                                            const isCompleted = crossedStageIds.has(step.id) && !isCurrent;
                                            const isVisited = crossedStageIds.has(step.id) || isCurrent;
                                            const nextStep = timelineSteps[index + 1];
                                            const isConnectorFilled =
                                                !!nextStep &&
                                                crossedStageIds.has(step.id) &&
                                                crossedStageIds.has(nextStep.id);

                                            return (
                                                <div key={step.id} className="relative flex-1 px-1 text-center">
                                                    {index < timelineSteps.length - 1 && (
                                                        <div
                                                            className={`absolute left-1/2 top-5 h-[3px] w-full ${isConnectorFilled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                                                        />
                                                    )}
                                                    <div
                                                        className={`relative z-10 mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all ${
                                                            isCurrent
                                                                ? 'border-blue-600 bg-blue-600 text-white ring-4 ring-blue-100'
                                                                : isCompleted
                                                                    ? 'border-emerald-600 bg-emerald-600 text-white'
                                                                    : 'border-slate-300 bg-white text-slate-400'
                                                        }`}
                                                    >
                                                        {isCompleted && !isCurrent ? (
                                                            <Check size={14} className="stroke-[3]" />
                                                        ) : isCurrent ? (
                                                            <User size={14} />
                                                        ) : (
                                                            <span className="text-xs font-black">{index + 1}</span>
                                                        )}
                                                    </div>
                                                    <p className={`mt-2 text-xs font-black uppercase tracking-widest ${isVisited ? 'text-slate-900' : 'text-slate-500'}`}>
                                                        {step.label}
                                                    </p>
                                                    {isCurrent && (
                                                        <p className="mt-1 text-xs font-black uppercase tracking-widest text-blue-600">Current</p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                            </div>
                                        </div>
                                    </div>
                                </section>

                        <section className="space-y-3 rounded-2xl border border-emerald-200 bg-[#ecf8ef] p-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">Technical Overlap Summary</h3>
                            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                {positiveSignals.slice(0, 4).map((signal, index) => (
                                    <div key={`${signal.detail}-${index}`} className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-base font-bold text-slate-700">
                                        {signal.detail}
                                    </div>
                                ))}
                            </div>
                            <div className="grid gap-4 pt-1">
                                <div className="space-y-2">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-emerald-700">Verified Strengths</h4>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <div className="space-y-1">
                                            {verifiedStrengthsLeft.map((signal, index) => (
                                                <div key={`pos-left-${index}`} className="flex items-start gap-2 text-base font-semibold text-slate-700">
                                                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                                                    <span>{signal.detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="space-y-1">
                                            {verifiedStrengthsRight.map((signal, index) => (
                                                <div key={`pos-right-${index}`} className="flex items-start gap-2 text-base font-semibold text-slate-700">
                                                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                                                    <span>{signal.detail}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {status === 'Interviewing' && interviewDetails && (
                            <section className="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-emerald-700" />
                                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">Interview Details</h3>
                                    {role === 'employer' && onStatusUpdate && (
                                        <button
                                            type="button"
                                            onClick={() => onStatusUpdate('Interviewing')}
                                            className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                                            aria-label="Edit interview"
                                        >
                                            <Pencil size={14} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid gap-3 text-base font-semibold text-slate-700 md:grid-cols-3">
                                    <p><span className="font-black text-emerald-700">Date:</span> {new Date(interviewDetails.date).toLocaleDateString()}</p>
                                    <p><span className="font-black text-emerald-700">Time:</span> {formatInterviewTime(interviewDetails.time)}</p>
                                    <p className="break-words"><span className="font-black text-emerald-700">Location:</span> {interviewDetails.location}</p>
                                </div>
                                {interviewDetails.notes && (
                                    <p className="text-base italic text-slate-700">"{interviewDetails.notes}"</p>
                                )}
                            </section>
                        )}

                        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
                            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-700">Status History (Immutable Log)</h3>
                            <div className="overflow-x-auto rounded-xl border border-slate-100">
                                <table className="min-w-full border-collapse text-left">
                                    <thead>
                                        <tr className="bg-slate-50 text-sm font-black uppercase tracking-widest text-slate-500">
                                            <th className="px-4 py-3">Status Node</th>
                                            <th className="px-4 py-3">Verification Comment</th>
                                            <th className="px-4 py-3">Timestamp</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {(statusHistory || []).map((log, index) => (
                                            <tr key={index} className="text-base font-semibold text-slate-700">
                                                <td className="px-4 py-3">
                                                    <span className={`rounded-full px-3 py-1 text-sm font-black uppercase tracking-widest ${getStatusChipClass(log.status)}`}>
                                                        {log.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 italic">{log.comment}</td>
                                                <td className="px-4 py-3 text-slate-500">{new Date(log.updatedAt).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {role === 'student' && (
                            <section className="grid gap-4 rounded-2xl border border-slate-200 bg-[#f8fafc] p-4 lg:grid-cols-2">
                                <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-indigo-600">
                                                <Building size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black uppercase tracking-wider text-slate-900">{employer?.companyName || internship?.company}</p>
                                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Hosting Partner</p>
                                            </div>
                                        </div>
                                        <div className="h-14 w-14 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                                            {employer?.profilePicture ? (
                                                <img
                                                    src={employer.profilePicture}
                                                    alt={`${employer?.companyName || internship?.company || 'Company'} profile`}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                                    <Building size={18} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2 border-t border-slate-100 pt-3">
                                        {employer?.email && (
                                            <a
                                                href={`mailto:${employer.email}`}
                                                className="flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                                            >
                                                <Mail size={13} /> {employer.email}
                                            </a>
                                        )}
                                        {employer?.phone && (
                                            <a
                                                href={`tel:${employer.phone}`}
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                                            >
                                                <Phone size={13} /> {employer.phone}
                                            </a>
                                        )}
                                        {employer?.website && (
                                            <a
                                                href={employer.website.startsWith('http') ? employer.website : `https://${employer.website}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:underline"
                                            >
                                                <Globe size={13} /> {employer.website}
                                            </a>
                                        )}
                                        {(employer?.location || internship?.location) && (
                                            <p className="flex items-center gap-2 text-sm font-semibold text-slate-600">
                                                <MapPin size={13} /> {employer?.location || internship?.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
