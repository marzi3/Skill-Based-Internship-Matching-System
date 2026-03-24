'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Filter, Calendar, CheckCircle2, Clock, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import axios from '@/services/apiClient';
import Card from '@/components/common/Card';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';

const ApplicationsPage = () => {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const res = await axios.get('/applications/employer');
                if (res.data.success) {
                    setApplications(res.data.data || []);
                }
            } catch (err) {
                console.error('Failed to fetch applications:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApplications();
    }, []);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Reviewing': return <Clock size={16} className="text-warning-500" />;
            case 'Interviewing': return <Calendar size={16} className="text-primary-500" />;
            case 'Selected': return <CheckCircle2 size={16} className="text-success-500" />;
            case 'Rejected': return <XCircle size={16} className="text-danger-500" />;
            default: return <Clock size={16} className="text-gray-400" />;
        }
    };

    const filteredApplications = applications.filter(app =>
        app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.internship?.positionTitle?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const updateStatus = async (id, newStatus) => {
        try {
            const res = await axios.patch(`/applications/${id}/status`, { status: newStatus });
            if (res.data.success) {
                setApplications(applications.map(app =>
                    app._id === id ? { ...app, status: newStatus } : app
                ));
            }
        } catch (err) {
            alert('Failed to update status');
        }
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Applications Pipeline</h1>
                        <p className="text-gray-600">Track and manage candidate submissions through the matching funnel</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <Card shadow="sm" rounded="lg" padding="none" className="overflow-hidden border border-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-primary-600" size={32} />
                    </div>
                ) : filteredApplications.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No applications found matching your criteria.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Candidate</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Target Role</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Match Score</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Applied Date</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-500">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredApplications.map((app) => (
                                <tr key={app._id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <Avatar
                                                src={app.student?.profilePicture}
                                                name={app.student?.name || 'Unknown'}
                                                size="md"
                                                className="rounded-xl"
                                            />
                                            <span className="font-bold text-gray-900">{app.student?.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 font-bold text-gray-600">{app.internship?.positionTitle || 'N/A'}</td>
                                    <td className="px-6 py-5">
                                        <select
                                            value={app.status}
                                            onChange={(e) => updateStatus(app._id, e.target.value)}
                                            className="text-xs font-black uppercase tracking-wider text-gray-700 bg-transparent border-none focus:ring-0 cursor-pointer"
                                        >
                                            <option value="Applied">Applied</option>
                                            <option value="Reviewing">Reviewing</option>
                                            <option value="Interviewing">Interviewing</option>
                                            <option value="Selected">Selected</option>
                                            <option value="Rejected">Rejected</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full max-w-[60px] overflow-hidden">
                                                <div className="bg-primary-500 h-full" style={{ width: `${app.matchScore || 0}%` }} />
                                            </div>
                                            <span className="text-xs font-black text-primary-600">{app.matchScore || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-gray-400 font-medium">
                                        {new Date(app.appliedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-5">
                                        <Link href={`/employer/applications/${app._id}`} className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-800 transition-colors">
                                            View Application
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </Card>
        </div>
    );
};

export default ApplicationsPage;
