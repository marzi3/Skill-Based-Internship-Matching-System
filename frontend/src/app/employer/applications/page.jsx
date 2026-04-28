'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Search, Loader2, ArrowLeft, ArrowRight, LayoutGrid, List } from 'lucide-react';
import axios from '@/services/apiClient';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

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

const STATUSES = ['All', 'Applied', 'Shortlisted', 'Interviewing', 'Selected', 'Accepted', 'Rejected', 'Withdrawn'];
const KANBAN_COLUMNS = ['Applied', 'Shortlisted', 'Interviewing', 'Accepted', 'Rejected'];

const ApplicationsPage = () => {
    const router = useRouter();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [viewMode, setViewMode] = useState('kanban');

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
        const matchesSearch = (app.student?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            decodeHtmlEntities(app.internship?.positionTitle || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || (app.status || 'Applied').toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getStatusPillClass = (status) => {
        switch ((status || '').toLowerCase()) {
            case 'selected':
            case 'accepted':
                return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'rejected':
            case 'withdrawn':
                return 'bg-rose-100 text-rose-800 border border-rose-200';
            case 'shortlisted':
            case 'interviewing':
                return 'bg-amber-100 text-amber-800 border border-amber-200';
            default:
                return 'bg-slate-100 text-slate-700 border border-slate-200';
        }
    };

    const desktopGridCols = 'md:grid-cols-[minmax(0,2.1fr)_minmax(0,2.1fr)_130px_180px_120px_96px]';

    return (
        <div className="p-6 md:p-10 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.push('/employer/dashboard')} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-gray-600 hover:text-gray-900 transition-all group">
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Pipeline</h1>
                        <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Track candidate submissions</p>
                    </div>
                </div>
                
                <div className="flex items-center flex-wrap gap-4">
                    <div className="relative group w-full md:w-64">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 w-4 h-4 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search talent or roles..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold shadow-sm"
                        />
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200 shadow-inner">
                        <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`} title="List View">
                            <List size={16}/>
                        </button>
                        <button onClick={() => setViewMode('kanban')} className={`p-2.5 rounded-xl transition-all flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white shadow-sm text-primary-600 font-bold' : 'text-gray-500 hover:text-gray-900'}`} title="Kanban View">
                            <LayoutGrid size={16}/>
                        </button>
                    </div>
                </div>
            </div>

            {/* Segmented Filter (Only shown in List View) */}
            <AnimatePresence>
                {viewMode === 'list' && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '2rem' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="flex items-center p-1.5 bg-gray-100/80 rounded-2xl w-fit border border-gray-200 shadow-inner overflow-x-auto max-w-full"
                    >
                        {STATUSES.map(tab => (
                            <button 
                                key={tab} 
                                onClick={() => setStatusFilter(tab)} 
                                className={`relative px-5 py-2.5 text-[11px] uppercase tracking-widest font-black rounded-xl transition-colors whitespace-nowrap z-10 ${statusFilter === tab ? 'text-primary-700' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {statusFilter === tab && <motion.div layoutId="activeStatusTab" className="absolute inset-0 bg-white rounded-xl shadow-sm border border-gray-200/50 -z-10" transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />}
                                {tab}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-pulse pt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-[400px] bg-slate-200 rounded-3xl"></div>
                    ))}
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                    <div className="w-24 h-24 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-gray-100">
                        <FileText size={32} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight mb-2">No Candidates Found</h3>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">Your pipeline is empty. Post a new internship or adjust your search filters.</p>
                </div>
            ) : viewMode === 'kanban' ? (
                /* Kanban View */
                <div className="flex gap-6 overflow-x-auto pb-8 pt-4 snap-x">
                    {KANBAN_COLUMNS.map((col, idx) => {
                        const colApps = filteredApplications.filter(app => {
                            const stat = app.status || 'Applied';
                            if (col === 'Accepted') return stat === 'Selected' || stat === 'Accepted';
                            return stat === col;
                        });
                        
                        return (
                            <motion.div 
                                key={col} 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="min-w-[340px] w-[340px] shrink-0 flex flex-col bg-gray-50/50 rounded-[2rem] border border-gray-200 p-5 snap-center shadow-sm"
                            >
                                <div className="flex items-center justify-between mb-5 px-2">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-800">{col}</h3>
                                    <span className="bg-white border border-gray-200 text-gray-500 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm">{colApps.length}</span>
                                </div>
                                
                                <div className="flex flex-col gap-4">
                                    {colApps.map(app => (
                                        <div 
                                            key={app._id} 
                                            onClick={() => openApplication(app._id)} 
                                            className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
                                        >
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar src={app.student?.profilePicture} name={app.student?.name} size="md" className="shadow-sm" />
                                                    <div>
                                                        <p className="text-base font-black text-gray-900 leading-tight group-hover:text-primary-600 transition-colors">{app.student?.name}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{new Date(app.appliedDate).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="mb-4">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Role</p>
                                                <p className="text-xs font-bold text-gray-800 truncate">{decodeHtmlEntities(app.internship?.positionTitle)}</p>
                                            </div>
                                            
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-16 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                                        <div className="h-full bg-primary-500 rounded-full" style={{width: `${app.matchScore || 0}%`}}/>
                                                    </div>
                                                    <span className="text-[10px] font-black text-primary-600">{app.matchScore || 0}%</span>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-primary-50 transition-colors">
                                                    <ArrowRight size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors group-hover:translate-x-0.5" />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {colApps.length === 0 && (
                                        <div className="text-center py-10 bg-transparent border-2 border-dashed border-gray-200 rounded-3xl mt-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Empty</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            ) : (
                /* List View */
                <Card shadow="sm" rounded="lg" padding="none" className="overflow-hidden border border-gray-100 bg-white">
                    <div className="bg-white p-4 md:p-6">
                        <div className="space-y-4">
                            <div className={`hidden md:grid ${desktopGridCols} md:items-center md:gap-4 md:px-4 mb-2`}>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Candidate</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Role</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Status</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Match</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</p>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 md:text-right">Action</p>
                            </div>

                            {filteredApplications.map((app) => (
                                <div
                                    key={app._id}
                                    onClick={() => openApplication(app._id)}
                                    className="group cursor-pointer rounded-3xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 md:px-8 md:py-6"
                                >
                                    <div className={`grid grid-cols-1 gap-5 ${desktopGridCols} md:items-center md:gap-4`}>
                                        <div>
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Candidate</p>
                                            <div className="flex min-w-0 items-center gap-4 md:whitespace-nowrap">
                                                <Avatar src={app.student?.profilePicture} name={app.student?.name || 'Unknown'} size="lg" className="shrink-0 shadow-sm" />
                                                <p className="truncate text-lg font-black tracking-tight text-slate-900 group-hover:text-primary-600 transition-colors">
                                                    {app.student?.name || 'Unknown'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Target Role</p>
                                            <p className="truncate text-sm font-bold text-slate-700 md:whitespace-nowrap">
                                                {decodeHtmlEntities(app.internship?.positionTitle || 'N/A')}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Status</p>
                                            <span className={`inline-flex items-center justify-center rounded-xl px-3 py-1.5 text-[10px] uppercase tracking-widest font-black whitespace-nowrap ${getStatusPillClass(app.status)}`}>
                                                {app.status || 'Applied'}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Match Score</p>
                                            <div className="flex items-center gap-3 whitespace-nowrap">
                                                <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                                                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${app.matchScore || 0}%` }} />
                                                </div>
                                                <span className="min-w-[42px] text-xs font-black text-primary-600">{app.matchScore || 0}%</span>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Date</p>
                                            <p className="text-sm font-black text-slate-500 whitespace-nowrap">
                                                {new Date(app.appliedDate).toLocaleDateString()}
                                            </p>
                                        </div>

                                        <div className="md:justify-self-end">
                                            <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-500 md:hidden">Action</p>
                                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-400 transition-all group-hover:translate-x-1 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 group-hover:shadow-lg">
                                                <ArrowRight size={20} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ApplicationsPage;
