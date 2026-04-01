'use client';

import { 
    Clock, CheckCircle2, Building, MapPin, 
    Calendar, FileText, Star, AlertTriangle, 
    ArrowLeft, ChevronRight, User, Mail, Download, ExternalLink,
    XCircle, ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import Badge from '@/components/common/Badge';
import Card from '@/components/common/Card';

/**
 * ApplicationDetailView
 * 
 * A comprehensive view of an application's lifecycle, matching data, and status history.
 * Used by both students (to track their own application) and employers (to review candidates).
 * 
 * @param {Object} application The application data from backend
 * @param {string} role 'student' or 'employer'
 * @param {function} onStatusUpdate Handler for employers to change status
 */
export default function ApplicationDetailView({ application, role, onStatusUpdate, onWithdraw }) {
    if (!application) return null;

    const { internship, student, employer, matchAnalysis, statusHistory, status, coverLetter, appliedDate, interviewDetails } = application;

    const timelineSteps = [
        { id: 'Applied', label: 'Submitted', description: 'Application received by system' },
        { id: 'Reviewing', label: 'Under Review', description: 'Employer is evaluating profile' },
        { id: 'Shortlisted', label: 'Shortlisted', description: 'Candidate moved to next round' },
        { id: 'Interviewing', label: 'Interview', description: 'Meeting scheduled with candidate' },
        { id: 'Offered', label: 'Offered', description: 'Official internship offer sent' },
        { id: 'Accepted', label: 'Accepted', description: 'Candidate accepted the position' }
    ];

    const currentStepIndex = timelineSteps.findIndex(step => step.id === status);
    
    // Fallback if status is Not in common steps (e.g. Rejected)
    const isRejected = status === 'Rejected';
    const isWithdrawn = status === 'Withdrawn';

    return (
        <div className="space-y-8 pb-20">
            {/* Header / Hero Section */}
            <div className="bg-white rounded-[2.5rem] p-8 lg:p-12 shadow-sm border border-slate-100 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner">
                                <Building className="text-indigo-600" size={24} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 mb-1">
                                    {internship?.company || 'Industrial Partner'}
                                </p>
                                <div className="flex items-center gap-2">
                                    <MapPin size={12} className="text-slate-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{internship?.location || 'Remote'}</span>
                                </div>
                            </div>
                        </div>

                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none italic">
                            {internship?.positionTitle}
                        </h1>

                        <div className="flex flex-wrap gap-3">
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                <Clock size={14} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">{internship?.duration || 'Unknown'} Months</span>
                            </div>
                            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2">
                                <Calendar size={14} className="text-indigo-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Applied {new Date(appliedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="px-4 py-2 bg-indigo-600 text-white rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/10">
                                <ShieldCheck size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">Protocol Sync: Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                        <div className="bg-slate-900 rounded-3xl p-6 text-white min-w-[200px] shadow-2xl relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl translate-x-1/2 -translate-y-1/2" />
                           <div className="relative z-10">
                                <div className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Match Intelligence</div>
                                <div className="flex items-end gap-2 mb-4">
                                    <span className="text-5xl font-black leading-none tracking-tighter">{matchAnalysis?.score || application.matchScore || 0}</span>
                                    <span className="text-xs font-bold text-slate-500 uppercase pb-1 tracking-widest">/ 100</span>
                                </div>
                                <div className="flex items-center justify-between text-[8px] font-black uppercase tracking-widest">
                                    <span className="text-slate-500 italic">Match Tier</span>
                                    <span className={`${matchAnalysis?.tier === 'DISQUALIFIED' ? 'text-rose-400' : 'text-emerald-400'}`}>
                                        {matchAnalysis?.tier || 'N/A'}
                                    </span>
                                </div>
                           </div>
                        </div>

                        {role === 'student' && !isWithdrawn && !isRejected && (
                            <button 
                                onClick={onWithdraw}
                                className="w-full py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border border-rose-100 mt-2"
                            >
                                Withdraw Application
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details & Snapshot */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Cover Letter Snapshot */}
                    <Card rounded="3xl" padding="8" shadow="sm" className="border-slate-100 overflow-hidden relative">
                         <div className="absolute top-0 right-0 p-8 opacity-5">
                            <FileText size={120} />
                         </div>
                         <div className="relative z-10">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Cover Letter Snapshot</h3>
                            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 italic font-medium text-slate-600 leading-relaxed text-sm">
                                {coverLetter || "No cover letter was provided with this submission."}
                            </div>
                         </div>
                    </Card>
                    
                    {/* Interview Details (if scheduled) */}
                    {status === 'Interviewing' && interviewDetails && (
                        <Card rounded="3xl" padding="8" shadow="sm" className="border-indigo-100 bg-indigo-50/30 overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 opacity-5 text-indigo-600">
                                <Calendar size={120} />
                            </div>
                            <div className="relative z-10 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-2 bg-indigo-600 rounded-lg text-white">
                                        <Clock size={16} />
                                    </div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600">Upcoming Interview Protocol</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Date</p>
                                        <p className="text-sm font-black text-slate-900">{new Date(interviewDetails.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Time</p>
                                        <p className="text-sm font-black text-slate-900">{interviewDetails.time}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Location</p>
                                        <p className="text-sm font-black text-indigo-600 underline font-bold truncate">
                                            {interviewDetails.location.includes('http') ? (
                                                <a href={interviewDetails.location} target="_blank" rel="noopener noreferrer">{interviewDetails.location}</a>
                                            ) : (
                                                interviewDetails.location
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {interviewDetails.notes && (
                                    <div className="mt-8 pt-6 border-t border-indigo-100/50">
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Protocol Notes</p>
                                        <p className="text-[11px] font-medium text-slate-600 italic">"{interviewDetails.notes}"</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    )}

                    {/* Technical Breakdown (Copy of logic from matchingEngine.js) */}
                    <Card rounded="3xl" padding="8" shadow="sm" className="bg-slate-900 border-none">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400 mb-6">Technical Overlap Summary</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Verified Strengths</h4>
                                <div className="space-y-3">
                                    {(matchAnalysis?.explanation || []).filter(e => e.score > 0).map((e, i) => (
                                        <div key={i} className="flex gap-3 text-xs font-bold text-slate-500">
                                            <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                                            <span>{e.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-[9px] font-black uppercase tracking-widest text-rose-500">Synchronization Gaps</h4>
                                <div className="space-y-3">
                                    {(matchAnalysis?.explanation || []).filter(e => e.score <= 0).map((e, i) => (
                                        <div key={i} className="flex gap-3 text-xs font-bold text-slate-500">
                                            <AlertTriangle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                                            <span>{e.detail}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                         </div>
                    </Card>

                    {/* Status History */}
                    <Card rounded="3xl" padding="8" shadow="sm" className="border-slate-100">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">Status History (Immutable Log)</h3>
                        <div className="overflow-hidden rounded-2xl border border-slate-50">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-[9px] font-black uppercase tracking-widest text-slate-500">
                                        <th className="px-6 py-4">Status Node</th>
                                        <th className="px-6 py-4">Verification Comment</th>
                                        <th className="px-6 py-4">Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {(statusHistory || []).map((log, i) => (
                                        <tr key={i} className="text-[11px] font-bold text-slate-600 italic">
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                                    log.status === 'Applied' ? 'bg-indigo-50 text-indigo-600' :
                                                    log.status === 'Rejected' ? 'bg-rose-50 text-rose-600' :
                                                    'bg-emerald-50 text-emerald-600'
                                                }`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">{log.comment}</td>
                                            <td className="px-6 py-4 text-slate-500">{new Date(log.updatedAt).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Timeline & Personal Info */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Visual Timeline */}
                    <Card rounded="3xl" padding="8" shadow="sm" className="border-slate-100 bg-[#FBFDFF]">
                         <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-8">Application Progress</h3>
                         <div className="relative pl-8 space-y-10">
                            {/* Vertical Line */}
                            <div className="absolute left-[3.5px] top-1 bottom-1 w-[1px] bg-slate-100" />
                            
                            {timelineSteps.map((step, i) => {
                                const isCompleted = i <= currentStepIndex;
                                const isCurrent = i === currentStepIndex;
                                return (
                                    <div key={step.id} className="relative">
                                        {/* Step Circle */}
                                        <div className={`absolute -left-8 top-1.5 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 transition-all ${
                                            isCompleted ? 'bg-indigo-600' : 'bg-slate-200'
                                        }`} />
                                        
                                        <div>
                                            <h4 className={`text-[10px] font-black uppercase tracking-widest mb-1 ${
                                                isCompleted ? 'text-slate-900' : 'text-slate-500'
                                            }`}>
                                                {step.label}
                                                {isCurrent && <span className="ml-2 text-[8px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md italic">Current Node</span>}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-500 italic leading-relaxed">{step.description}</p>
                                        </div>
                                    </div>
                                );
                            })}
                         </div>
                    </Card>

                    {/* Student Profile Card (visible to employer) */}
                    {role === 'employer' && (
                        <Card rounded="3xl" padding="8" shadow="sm" className="bg-white border-slate-100 group">
                            <div className="flex flex-col items-center text-center space-y-4">
                                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-slate-100 shadow-inner group-hover:scale-105 transition-transform duration-500">
                                    <User size={40} className="text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">{student?.name}</h3>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#6366F1]">{student?.email}</p>
                                </div>
                                <div className="w-full pt-4 border-t border-slate-50 flex flex-col gap-3">
                                    <Link 
                                        href={`/student/${student?._id}`}
                                        className="flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] hover:bg-black transition-all"
                                    >
                                        Inspect Full Profile <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    )}

                    {/* Employer Info Card (visible to student) */}
                    {role === 'student' && (
                        <Card rounded="3xl" padding="8" shadow="sm" className="bg-white border-slate-100">
                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100 shadow-inner text-indigo-600">
                                        <Building size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{employer?.companyName}</h3>
                                        <p className="text-[10px] font-bold text-slate-500 italic">Hosting Partner</p>
                                    </div>
                                </div>
                                <div className="space-y-4 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                        <Mail size={14} className="text-slate-500" />
                                        <span>Official protocol communication channeled through dashboard</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500">
                                        <ShieldCheck size={14} className="text-emerald-500" />
                                        <span>Identity Verified by Antigravity Network</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

// Internal Link component since we're in a component file
import Link from 'next/link';
