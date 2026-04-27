'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import axios from '@/services/apiClient';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';

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

const ApplicationsPage = () => {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const openApplication = (applicationId) => {
        router.push(`/employer/applications/${applicationId}`);
    };

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

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            decodeHtmlEntities(app.internship?.positionTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || (app.status || 'Applied').toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusPillClass = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'selected':
            case 'accepted':
                return 'bg-emerald-100 text-emerald-800';
            case 'rejected':
            case 'withdrawn':
                return 'bg-rose-100 text-rose-800';
            case 'shortlisted':
            case 'interviewing':
                return 'bg-amber-100 text-amber-800';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const desktopGridCols = 'md:grid-cols-[minmax(0,2.1fr)_minmax(0,2.1fr)_130px_180px_120px_96px]';

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Applications</h1>
                        <p className="text-gray-600">Track and manage candidate submissions through the matching funnel</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search applicants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="appearance-none px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white cursor-pointer"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Withdrawn">Withdrawn</option>
                    </select>
                </div>
            </div>

            <Card shadow="sm" rounded="lg" padding="none" className="overflow-hidden border border-gray-100 bg-transparent">
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
                    <div className="bg-transparent p-4 md:p-6">
                        <div className="space-y-5">
                                <div className={`hidden md:grid ${desktopGridCols} md:items-center md:gap-4 md:px-2`}>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Candidate</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Target Role</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Status</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Match Score</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Applied Date</p>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 md:text-right">Action</p>
                                </div>

                                {filteredApplications.map((app) => (
                                    <div
                                        key={app._id}
                                        onClick={() => openApplication(app._id)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                openApplication(app._id);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="link"
                                        aria-label={`View application for ${app.student?.name || 'Unknown'} and ${decodeHtmlEntities(app.internship?.positionTitle || 'N/A')}`}
                                        className="group cursor-pointer rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:p-7"
                                    >
                                        <div className={`grid grid-cols-1 gap-5 ${desktopGridCols} md:items-center md:gap-4`}>
                                            <div>
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Candidate</p>
                                                <div className="flex min-w-0 items-center gap-3 md:whitespace-nowrap">
                                                    <Avatar
                                                        src={app.student?.profilePicture}
                                                        name={app.student?.name || 'Unknown'}
                                                        size="md"
                                                        className="shrink-0"
                                                    />
                                                    <p className="truncate text-2xl font-black tracking-tight text-slate-900 md:text-xl lg:text-2xl">
                                                        {app.student?.name || 'Unknown'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Target Role</p>
                                                <p className="truncate text-2xl font-black tracking-tight text-slate-900 md:whitespace-nowrap">
                                                    {decodeHtmlEntities(app.internship?.positionTitle || 'N/A')}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Status</p>
                                                <span className={`inline-flex min-w-[110px] items-center justify-center rounded-full px-3 py-1 text-sm font-black whitespace-nowrap ${getStatusPillClass(app.status)}`}>
                                                    {app.status || 'Applied'}
                                                </span>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Match Score</p>
                                                <div className="flex items-center gap-2 whitespace-nowrap">
                                                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                                                        <div className="h-full bg-primary-500" style={{ width: `${app.matchScore || 0}%` }} />
                                                    </div>
                                                    <span className="min-w-[42px] text-right text-sm font-black text-primary-600">{app.matchScore || 0}%</span>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Applied Date</p>
                                                <p className="text-xl font-black tracking-tight text-slate-900 whitespace-nowrap">
                                                    {new Date(app.appliedDate).toLocaleDateString()}
                                                </p>
                                            </div>

                                            <div className="md:justify-self-end">
                                                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Action</p>
                                                <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                                                    <Link
                                                        href={`/employer/applications/${app._id}`}
                                                        onClick={(e) => e.stopPropagation()}
                                                        className="text-xs font-black uppercase tracking-[0.2em] text-primary-600 hover:text-primary-800 transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition-all group-hover:translate-x-1 group-hover:bg-primary-700">
                                                        <ArrowRight size={20} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ApplicationsPage;
