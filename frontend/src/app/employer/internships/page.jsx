'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from '@/services/apiClient';
import {
    Search, Edit3, Trash2, Eye, Users, Calendar,
    ArrowLeft, Loader2, AlertCircle, Power,
    CheckCircle2, XCircle, Briefcase, LayoutGrid,
} from 'lucide-react';

import { ConfirmModal } from '@/components/common/Modal';
import Toast from '@/components/common/Toast';

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

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
    const cfg = {
        Hiring: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        Closed: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-100', dot: 'bg-rose-500', icon: <XCircle className="w-3.5 h-3.5" /> },
        Reviewing: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-100', dot: 'bg-amber-500', icon: <Power className="w-3.5 h-3.5" /> },
    };
    const s = cfg[status] || cfg.Reviewing;
    return (
        <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${s.bg} ${s.text} ${s.border}`}>
            {s.icon} {status}
        </span>
    );
};

/* ── Main page ── */
export default function MyPostingsPage() {
    const [internships, setInternships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const searchParams = useSearchParams();

    /** Read status filter from URL on mount (e.g. from dashboard View More). */
    useEffect(() => {
        const urlStatus = searchParams.get('status');
        if (urlStatus && ['Hiring', 'Closed', 'Reviewing'].includes(urlStatus)) {
            setStatusFilter(urlStatus);
        }
    }, [searchParams]);

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchMyInternships = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/internships/my-postings');
            setInternships(res.data.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load postings.');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMyInternships(); }, []);

    const toggleStatus = async (id) => {
        try {
            const res = await axios.patch(`/internships/${id}/status`);
            if (res.data.success) {
                setInternships(p => p.map(i => i._id === id ? { ...i, status: res.data.data.status } : i));
                showToast('success', 'Status Updated', `Posting is now ${res.data.data.status}.`);
            }
        } catch (e) { showToast('error', 'Update Failed', e.response?.data?.message || 'Try again.'); }
    };

    const openDel = (i) => setDeleteModal({ isOpen: true, id: i._id, title: decodeHtmlEntities(i.positionTitle || 'Untitled Position') });
    const closeDel = () => { if (!deleteLoading) setDeleteModal({ isOpen: false, id: null, title: '' }); };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/internships/${deleteModal.id}`);
            const t = deleteModal.title;
            setInternships(p => p.filter(i => i._id !== deleteModal.id));
            closeDel();
            showToast('success', 'Deleted', `"${t}" has been removed.`);
        } catch (e) {
            showToast('error', 'Delete Failed', e.response?.data?.message || 'Could not delete.');
            closeDel();
        } finally { setDeleteLoading(false); }
    };

    const filtered = internships.filter(i => {
        const matchSearch = decodeHtmlEntities(i?.positionTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            decodeHtmlEntities(i?.domain || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchStatus = statusFilter === 'All' || i.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const stats = [
        {
            label: 'Total Views',
            value: internships.reduce((a, c) => a + (c.views || 0), 0),
            icon: Eye,
            gradient: 'from-violet-500 to-indigo-600',
            light: 'bg-violet-50',
            text: 'text-violet-600',
        },
        {
            label: 'Total Applicants',
            value: internships.reduce((a, c) => a + (c.applicants?.length || 0), 0),
            icon: Users,
            gradient: 'from-emerald-400 to-teal-500',
            light: 'bg-emerald-50',
            text: 'text-emerald-600',
        },
        {
            label: 'Active Roles',
            value: internships.filter(i => i.status === 'Hiring').length,
            icon: LayoutGrid,
            gradient: 'from-orange-400 to-rose-500',
            light: 'bg-orange-50',
            text: 'text-orange-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && <Toast type={toast.type} title={toast.title} message={toast.message}
                position="top-right" duration={3500} onClose={() => setToast(null)} />}

            {/* Delete Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen} onClose={closeDel} onConfirm={confirmDelete}
                title="Delete Internship Posting"
                message={
                    <span>
                        Are you sure you want to permanently delete{' '}
                        <strong className="text-gray-900">&ldquo;{deleteModal.title}&rdquo;</strong>?
                        <span className="block mt-2 text-sm text-red-500 font-medium">
                            ⚠ This cannot be undone. All applicant data will be lost.
                        </span>
                    </span>
                }
                confirmText="Yes, Delete" cancelText="Cancel"
                confirmButtonVariant="danger" loading={deleteLoading}
            />

            {/* ═══ HEADER SECTION ═══ */}
            <div className="bg-white border-b border-gray-100 shadow-sm relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-8 py-10 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <Link href="/employer/dashboard">
                                <button className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md text-gray-600 transition-all group">
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <Briefcase className="text-primary-600 w-5 h-5" />
                                    <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em]">Operational Management</span>
                                </div>
                                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Postings Management</h1>
                                <p className="text-sm text-gray-500 font-bold mt-1 uppercase tracking-widest leading-none">Track and coordinate your active internship roles</p>
                            </div>
                        </div>
                        
                        <Link href="/employer/post-internship">
                            <button className="flex items-center gap-3 bg-primary-600 text-white px-10 py-4 rounded-2xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/20 font-black text-sm uppercase tracking-widest">
                                <LayoutGrid size={18} /> New Posting
                            </button>
                        </Link>
                    </div>
                </div>
                {/* Subtle geometric decor */}
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50/30 to-transparent pointer-events-none" />
            </div>

            <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

                {/* ═══ STAT CARDS ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
                    {stats.map(s => (
                        <div key={s.label}
                            className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 p-8 flex items-center justify-between group relative overflow-hidden">
                            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-700`} />
                            <div>
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{s.label}</p>
                                <p className="text-5xl font-black text-gray-900 mt-2 tracking-tighter">{s.value}</p>
                            </div>
                            <div className={`w-16 h-16 rounded-3xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                <s.icon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ TABLE CARD ═══ */}
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-8 py-8 border-b border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-6 bg-gray-50/30">
                        <div className="relative w-full max-w-md group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search roles, domains, or tags…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all shadow-sm group-hover:bg-gray-50/50"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-6 py-3 rounded-2xl bg-primary-50 border border-primary-100 text-primary-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                {filtered.length} total records
                            </div>
                            <div className="relative">
                                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                                    className="appearance-none pl-4 pr-8 py-3 border border-gray-200 rounded-2xl text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary-500/10 bg-white cursor-pointer shadow-sm">
                                    <option value="All">All Statuses</option>
                                    <option value="Hiring">Hiring</option>
                                    <option value="Reviewing">Reviewing</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="py-20 flex flex-col items-center gap-3 text-gray-500">
                            <Loader2 className="w-9 h-9 animate-spin text-indigo-500" />
                            <p className="text-sm font-semibold">Loading postings…</p>
                        </div>
                    )}

                    {/* Error */}
                    {!loading && error && (
                        <div className="py-16 text-center px-6">
                            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <AlertCircle className="w-7 h-7 text-red-400" />
                            </div>
                            <p className="font-bold text-gray-800 mb-1">Couldn't load postings</p>
                            <p className="text-sm text-gray-500 mb-5">{error}</p>
                            <button onClick={fetchMyInternships}
                                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-md shadow-indigo-200">
                                Retry
                            </button>
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="py-20 text-center">
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Briefcase className="w-8 h-8 text-indigo-300" />
                            </div>
                            <p className="font-extrabold text-gray-800 text-lg mb-1">No postings found</p>
                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                {searchQuery ? `No results for "${searchQuery}".` : 'Use the sidebar to create your first internship.'}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && filtered.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        {['Position Identity', 'Inception Date', 'Status', 'Actions'].map((h, i) => (
                                            <th key={h} className={`px-8 py-5 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] border-b border-gray-100 ${i === 3 ? 'text-right' : ''}`}>
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                {filtered.map((internship) => (
                                    <tr key={internship._id}
                                        className="hover:bg-primary-50/20 transition-all duration-300 group">

                                        {/* Title */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                                                    <Briefcase className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-gray-900 text-base leading-tight group-hover:text-primary-600 transition-colors">
                                                        {decodeHtmlEntities(internship.positionTitle || 'Untitled Role')}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest py-0.5 px-2 bg-primary-50 rounded-md">
                                                            {decodeHtmlEntities(internship.domain || 'General')}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">Sector</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <Calendar className="w-4 h-4 text-primary-400" />
                                                <span className="text-sm font-black text-gray-600">
                                                    {new Date(internship.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-8 py-6">
                                            <StatusBadge status={internship.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-8 py-6">
                                            <div className="flex items-center justify-end gap-3 animate-in fade-in duration-500">

                                                {/* Toggle */}
                                                <button
                                                    onClick={() => toggleStatus(internship._id)}
                                                    title={internship.status === 'Hiring' ? 'Deactivate Role' : 'Activate Role'}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 font-black transition-all duration-300 ${internship.status === 'Hiring'
                                                        ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                                                        : 'bg-amber-50 border-amber-100 text-amber-600 hover:bg-amber-500 hover:text-white hover:border-amber-500'
                                                        }`}
                                                >
                                                    <Power className="w-5 h-5" />
                                                </button>

                                                {/* Edit */}
                                                <Link href={`/employer/internships/${internship._id}/edit`}>
                                                    <button title="Modify Details"
                                                        className="w-10 h-10 flex items-center justify-center rounded-xl border-2 bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all duration-300">
                                                        <Edit3 className="w-5 h-5" />
                                                    </button>
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => openDel(internship)}
                                                    title="Permanently Remove"
                                                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
