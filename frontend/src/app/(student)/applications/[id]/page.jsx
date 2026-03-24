'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import axios from '@/services/apiClient';
import ApplicationDetailView from '@/components/application/ApplicationDetailView';
import { PageLoader } from '@/components/common/Loader';
import Link from 'next/link';

/**
 * Student Application Detail Page
 * 
 * Provides students with a deep dive into their application status,
 * match analysis, and the ability to withdraw their protocol.
 */
export default function StudentApplicationDetailPage({ params }) {
    const { id } = use(params);
    const router = useRouter();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const res = await axios.get(`/applications/${id}`);
                if (res.data.success) {
                    setApplication(res.data.data);
                }
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || 'Failed to fetch application details');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchApplication();
    }, [id]);

    const handleWithdraw = async () => {
        if (!window.confirm('Are you sure you want to withdraw this application? This action cannot be undone.')) return;
        
        try {
            const res = await axios.delete(`/applications/${id}/withdraw`);
            if (res.data.success) {
                // Refresh data to show withdrawn status
                const updated = await axios.get(`/applications/${id}`);
                setApplication(updated.data.data);
            }
        } catch (err) {
            alert('Withdrawal failed');
        }
    };

    if (loading) return <PageLoader />;

    if (error || !application) {
        return (
            <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-8 text-center">
                <div className="bg-white p-12 rounded-[3rem] shadow-sm max-w-md border border-slate-100">
                    <h2 className="text-2xl font-black text-slate-900 mb-4 tracking-tight uppercase">Node Not Found</h2>
                    <p className="text-slate-500 font-bold mb-8 italic">The requested application protocol could not be synchronized with the local terminal.</p>
                    <Link href="/applications" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-indigo-700 transition-all">
                        <ArrowLeft size={16} /> Return to Applications
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-6 lg:p-12">
            <div className="max-w-6xl mx-auto space-y-8">
                <Link 
                    href="/applications" 
                    className="inline-flex items-center gap-3 text-slate-400 hover:text-slate-900 transition-colors font-black uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={16} /> Back to Applications
                </Link>

                <ApplicationDetailView 
                    application={application} 
                    role="student"
                    onWithdraw={handleWithdraw}
                />
            </div>
        </div>
    );
}
