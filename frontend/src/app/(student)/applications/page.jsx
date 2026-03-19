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

export default function StudentApplications() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('/applications/student', {
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
        <div className="p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
            <div className="flex items-center gap-4 mb-2">
                <Link href="/student-dashboard" className="p-3 bg-white border border-gray-200 hover:border-primary-300 hover:bg-primary-50 rounded-xl transition-all group shadow-sm flex-shrink-0">
                    <ArrowLeft size={20} className="text-gray-500 group-hover:text-primary-600 transition-colors" />
                </Link>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Applied Protocols</h1>
                    <p className="text-gray-500 font-medium">Tracking your active synchronization requests across the network</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {loading ? (
                    <div className="py-20 text-center"><Loader className="animate-spin mx-auto text-primary-600" size={32} /></div>
                ) : applications.length > 0 ? (
                    applications.map((app) => (
                        <Card key={app._id} className="hover:border-primary-200 transition-all border border-gray-100 p-6">
                            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 border border-gray-100">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{app.internship?.positionTitle}</h3>
                                        <p className="text-primary-600 font-bold text-sm tracking-widest">{app.internship?.employer?.companyName || app.employer?.companyName}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-12 text-sm">
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Status</span>
                                        <Badge variant={getStatusStyle(app.status)}>{app.status}</Badge>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Applied</span>
                                        <span className="text-gray-900 font-bold">{new Date(app.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link href={`/internships/${app.internship?._id}`} className="px-6 py-2 text-primary-600 font-black uppercase text-[10px] tracking-widest hover:underline transition-all">
                                        View Spec
                                    </Link>
                                    <button 
                                        onClick={() => setSelectedApp(app)}
                                        className="p-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all shadow-lg group/btn"
                                    >
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="py-20 text-center space-y-4 border-dashed border-2">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No active applications detected.</p>
                        <Link href="/find-internships" className="inline-block bg-primary-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:bg-primary-700">
                            Browse Internships
                        </Link>
                    </Card>
                )}
            </div>

            {/* Status Detail Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)}></div>
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 animate-in fade-in zoom-in duration-300">
                        <div className="bg-gradient-to-r from-gray-900 to-indigo-900 p-8 text-white relative">
                            <button 
                                onClick={() => setSelectedApp(null)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <XCircle size={20} />
                            </button>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/10 rounded-2xl">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black uppercase tracking-tight">{selectedApp.internship?.positionTitle}</h2>
                                    <p className="text-indigo-200 font-bold tracking-widest text-sm">{selectedApp.internship?.employer?.companyName || selectedApp.employer?.companyName}</p>
                                </div>
                            </div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                                <span className="text-xs font-bold uppercase tracking-widest">Protocol Sync: Active</span>
                            </div>
                        </div>

                        <div className="p-8 space-y-10">
                            {/* Visual Timeline */}
                            <div className="relative">
                                {/* Connecting Line */}
                                <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 rounded-full">
                                    <div 
                                        className="h-full bg-primary-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${(getTimelineStep(selectedApp.status) / 3) * 100}%` }}
                                    ></div>
                                </div>

                                <div className="relative flex justify-between">
                                    {['Applied', 'Review', 'Interview', 'Decision'].map((step, idx) => {
                                        const currentStep = getTimelineStep(selectedApp.status);
                                        const isActive = idx <= currentStep;
                                        const isCurrent = idx === currentStep;

                                        return (
                                            <div key={step} className="flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                                                    isCurrent ? 'bg-primary-600 border-primary-100 text-white scale-110 shadow-lg' : 
                                                    isActive ? 'bg-primary-600 border-white text-white' : 
                                                    'bg-white border-gray-100 text-gray-300'
                                                }`}>
                                                    {isActive ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                                                </div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>
                                                    {step}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Current Status</span>
                                    <Badge variant={getStatusStyle(selectedApp.status)} className="text-sm px-4 py-1">{selectedApp.status}</Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Last Update</span>
                                    <span className="text-sm font-black text-gray-900">{new Date(selectedApp.updatedAt || selectedApp.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="pt-4 mt-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 leading-relaxed italic">
                                        {selectedApp.status === 'Pending' && "Your credentials have been successfully transmitted. The employer will review your profile shortly."}
                                        {selectedApp.status === 'Under Review' && "Employer is currently evaluating your skill matrix against the protocol requirements."}
                                        {selectedApp.status === 'Interview' && "High compatibility detected! The employer has initiated an interview request. Check your messages."}
                                        {selectedApp.status === 'Selected' && "Protocol successfully established. You have been selected for this position!"}
                                        {selectedApp.status === 'Rejected' && "The employer has opted to synchronize with another candidate. Keep optimizing your profile!"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <Link 
                                    href="/messages"
                                    className="flex-1 py-4 bg-white border-2 border-gray-900 text-gray-900 rounded-2xl font-black uppercase text-xs tracking-widest text-center hover:bg-gray-50 transition-colors"
                                >
                                    Message Employer
                                </Link>
                                <button 
                                    onClick={() => setSelectedApp(null)}
                                    className="flex-1 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest text-center hover:bg-black transition-all shadow-lg shadow-gray-200"
                                >
                                    Close Monitor
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
