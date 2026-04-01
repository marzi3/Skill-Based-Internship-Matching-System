'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Loader2, ChevronDown, UserCircle } from 'lucide-react';
import axios from '@/services/apiClient';
import ApplicationDetailView from '@/components/application/ApplicationDetailView';
import InterviewModal from '@/components/application/InterviewModal';
import { PageLoader } from '@/components/common/Loader';
import Link from 'next/link';

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

    const handleStatusUpdate = async (newStatus, interviewDetails = null) => {
        if (newStatus === 'Interviewing' && !interviewDetails) {
            setShowInterviewModal(true);
            return;
        }

        try {
            setUpdating(true);
            const payload = { 
                status: newStatus,
                comment: `Candidate moved to ${newStatus} phase.`
            };
            if (interviewDetails) payload.interviewDetails = interviewDetails;

            const res = await axios.patch(`/applications/${id}/status`, payload);
            if (res.data.success) {
                // Refresh data to show in history
                const updated = await axios.get(`/applications/${id}`);
                setApplication(updated.data.data);
                setShowInterviewModal(false);
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Status update failed';
            alert(msg);
        } finally {
            setUpdating(false);
        }
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

    if (error || !application) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center uppercase tracking-widest">
                <div className="bg-white p-12 rounded-[3.5rem] shadow-sm max-w-md border border-slate-100">
                    <h2 className="text-xl font-black text-slate-900 mb-4">Transmission Error</h2>
                    <p className="text-slate-500 font-bold mb-8 text-[10px]">The requested candidate protocol is unreachable or has been terminated.</p>
                    <Link href="/employer/applications" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] hover:bg-slate-900 transition-all shadow-xl shadow-indigo-600/20">
                        <ArrowLeft size={14} /> Return to Pipeline
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Top Action Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <Link 
                        href="/employer/applications" 
                        className="inline-flex items-center gap-3 text-slate-500 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest"
                    >
                        <ArrowLeft size={16} /> Candidate Pipeline
                    </Link>

                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md p-2 rounded-3xl border border-white">
                        <div className="pl-4 hidden sm:block">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-0.5 text-right">Protocol Progression</p>
                            <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest text-right">Current: {application.status}</p>
                        </div>
                        
                        <div className="h-10 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

                        <div className="relative group">
                            <select 
                                value={application.status}
                                onChange={(e) => handleStatusUpdate(e.target.value)}
                                disabled={updating}
                                className="appearance-none bg-slate-900 text-white pl-6 pr-12 py-3.5 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-black transition-all cursor-pointer disabled:opacity-50"
                            >
                                {statusOptions.map(opt => (
                                    <option 
                                        key={opt} 
                                        value={opt} 
                                        disabled={isOptionDisabled(opt)}
                                        className={application.status === opt ? "bg-slate-100 font-bold" : ""}
                                    >
                                        {opt} {application.status === opt ? '(Current)' : ''}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                            {updating && <Loader2 size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-indigo-400 animate-spin" />}
                        </div>
                    </div>
                </div>

                <InterviewModal 
                    isOpen={showInterviewModal}
                    onClose={() => setShowInterviewModal(false)}
                    onConfirm={(details) => handleStatusUpdate('Interviewing', details)}
                    application={application}
                />

                <ApplicationDetailView 
                    application={application} 
                    role="employer"
                />
            </div>
        </div>
    );
}
