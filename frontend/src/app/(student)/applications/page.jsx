'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import {
    FileText,
    Search,
    Filter,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowRight,
    ArrowLeft,
    Loader
} from 'lucide-react';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function StudentApplications() {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('applications/student', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token') || document.cookie.replace(/(?:(?:^|.*;\s*)token\s*\=\s*([^;]*).*$)|^.*$/, "$1")}` }
                });
                setApplications(res.data.data || []);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchApplications();
    }, []);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Selected': return 'success';
            case 'Rejected': return 'danger';
            case 'Interview': return 'info';
            default: return 'warning';
        }
    };

    const getTimelineStep = (status) => {
        const steps = ['Applied', 'Under Review', 'Interview', 'Decision'];
        if (status === 'Pending') return 0;
        if (status === 'Under Review') return 1;
        if (status === 'Interview') return 2;
        if (status === 'Selected' || status === 'Rejected') return 3;
        return 0;
    };

    return (
        <div className="p-6 max-w-6xl mx-auto space-y-8 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/student-dashboard" className="p-3 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-xl transition-all group shadow-sm flex-shrink-0">
                    <ArrowLeft size={20} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Applied Internships</h1>
                    <p className="text-gray-500 font-medium">Tracking your active synchronization requests across the network</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center"><Loader className="animate-spin mx-auto text-primary-600" size={32} /></div>
                ) : applications.length > 0 ? (
                    applications.map((app) => (
                        <Card
                            key={app._id}
                            onClick={() => app.internship?._id && router.push(`/internships/${app.internship._id}`)}
                            className="hover:border-primary-200 transition-all border border-gray-100 p-6 cursor-pointer"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-100 flex-shrink-0">
                                        {app.employer?.profilePicture ? (
                                            <img 
                                                src={app.employer.profilePicture.startsWith('http') ? app.employer.profilePicture : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/${app.employer.profilePicture}`} 
                                                alt={app.employer?.companyName} 
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <FileText size={24} className="text-gray-500" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{decodeHtmlEntities(app.internship?.positionTitle || 'Untitled Role')}</h3>
                                        <p className="text-primary-600 font-bold text-sm tracking-widest">{app.internship?.employer?.companyName || app.employer?.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 text-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</span>
                                        <Badge variant={getStatusStyle(app.status)}>{app.status}</Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Applied</span>
                                        <span className="text-gray-900 font-bold">{new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link
                                        href={`/internships/${app.internship?._id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="px-6 py-2 text-primary-600 font-black uppercase text-[10px] tracking-widest hover:underline transition-all"
                                    >
                                        View Spec
                                    </Link>
                                    <Link 
                                        href={`/internships/${app.internship?._id}`}
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg group/btn"
                                    >
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="py-20 text-center space-y-4 border-dashed border-2">
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No active applications detected.</p>
                        <Link href="/find-internships" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:bg-primary-700">
                            Browse Internships
                        </Link>
                    </Card>
                )}
            </div>
        </div>
    );
}
