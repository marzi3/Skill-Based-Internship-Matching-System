'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from '@/services/apiClient';
import {
    Search, Edit3, Trash2, Eye, Users, Calendar,
    ArrowLeft, Loader2, AlertCircle, Power,
    CheckCircle2, XCircle, Briefcase, LayoutGrid,
} from 'lucide-react';

import { ConfirmModal } from '@/components/common/Modal';
import Toast from '@/components/common/Toast';

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
    const cfg = {
        Hiring: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-300', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        Closed: { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-300', dot: 'bg-rose-500', icon: <XCircle className="w-3.5 h-3.5" /> },
        Reviewing: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-300', dot: 'bg-amber-500', icon: <Power className="w-3.5 h-3.5" /> },
    };
    const s = cfg[status] || cfg.Reviewing;
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
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
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (type, title, message) => {
        setToast({ type, title, message });
        setTimeout(() => setToast(null), 3500);
    };

    const fetchMyInternships = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/internships/my-postings');
            setInternships(res.data.data || []);
        } catch (e) {
            setError(e.response?.data?.message || 'Failed to load postings.');
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchMyInternships(); }, []);

    const toggleStatus = async (id) => {
        try {
            const res = await axios.patch(`/api/internships/${id}/status`);
            if (res.data.success) {
                setInternships(p => p.map(i => i._id === id ? { ...i, status: res.data.data.status } : i));
                showToast('success', 'Status Updated', `Posting is now ${res.data.data.status}.`);
            }
        } catch (e) { showToast('error', 'Update Failed', e.response?.data?.message || 'Try again.'); }
    };

    const openDel = (i) => setDeleteModal({ isOpen: true, id: i._id, title: i.positionTitle || 'Untitled Position' });
    const closeDel = () => { if (!deleteLoading) setDeleteModal({ isOpen: false, id: null, title: '' }); };

    const confirmDelete = async () => {
        setDeleteLoading(true);
        try {
            await axios.delete(`/api/internships/${deleteModal.id}`);
            const t = deleteModal.title;
            setInternships(p => p.filter(i => i._id !== deleteModal.id));
            closeDel();
            showToast('success', 'Deleted', `"${t}" has been removed.`);
        } catch (e) {
            showToast('error', 'Delete Failed', e.response?.data?.message || 'Could not delete.');
            closeDel();
        } finally { setDeleteLoading(false); }
    };

    const filtered = internships.filter(i =>
        (i?.positionTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i?.domain || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* ═══ TOPBAR — gradient theme ═══ */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 shadow-xl shadow-indigo-900/20">
                <div className="max-w-6xl mx-auto px-6 py-6 flex items-center gap-5">
                    <Link href="/employer/dashboard">
                        <button className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 backdrop-blur-sm transition-all duration-200 shadow-inner">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shadow-lg">
                            <Briefcase className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">My Postings</h1>
                            <p className="text-xs text-indigo-200 font-semibold mt-0.5 tracking-wide">Manage and track all your active internship roles</p>
                        </div>
                    </div>

                    {/* decorative dots */}
                    <div className="ml-auto flex items-center gap-2 opacity-30">
                        <span className="w-2 h-2 rounded-full bg-white" />
                        <span className="w-3 h-3 rounded-full bg-white" />
                        <span className="w-2 h-2 rounded-full bg-white" />
                    </div>
                </div>

                {/* wave divider */}
                <div className="h-3 bg-gray-50" style={{ clipPath: 'ellipse(55% 100% at 50% 0%)' }} />
            </div>

            <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">

                {/* ═══ STAT CARDS ═══ */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {stats.map(s => (
                        <div key={s.label}
                            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5 flex items-center justify-between group overflow-hidden relative">
                            {/* subtle gradient glow on hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-[0.04] transition-opacity duration-500 rounded-2xl`} />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                                <p className="text-4xl font-black text-gray-900 mt-1">{s.value}</p>
                            </div>
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg`}>
                                <s.icon className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* ═══ TABLE CARD ═══ */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    {/* Toolbar */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
                        <div className="relative w-full max-w-xs">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                            <input
                                type="text"
                                placeholder="Search positions or domains…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-sm font-bold text-gray-800 placeholder:text-indigo-300 placeholder:font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 focus:bg-white transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-sm shadow-indigo-200">
                                {filtered.length} posting{filtered.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
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
                            <p className="text-sm text-gray-400 mb-5">{error}</p>
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
                            <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                {searchQuery ? `No results for "${searchQuery}".` : 'Use the sidebar to create your first internship.'}
                            </p>
                        </div>
                    )}

                    {/* Table */}
                    {!loading && !error && filtered.length > 0 && (
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Position Title', 'Date Posted', 'Status', 'Actions'].map((h, i) => (
                                        <th key={h} className={`px-6 py-3.5 text-[10px] font-black text-gray-400 uppercase tracking-widest ${i === 3 ? 'text-right' : 'text-left'}`}>
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((internship) => (
                                    <tr key={internship._id}
                                        className="hover:bg-indigo-50/40 transition-colors duration-150 group">

                                        {/* Title */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shrink-0 group-hover:from-indigo-200 group-hover:to-violet-200 transition-all">
                                                    <Briefcase className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm group-hover:text-indigo-700 transition-colors">
                                                        {internship.positionTitle || 'Untitled Position'}
                                                    </p>
                                                    <p className="text-xs font-semibold text-indigo-400 mt-0.5">
                                                        {internship.domain || 'No Category'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5 text-gray-300" />
                                                <span className="text-sm font-semibold text-gray-500">
                                                    {new Date(internship.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric', month: 'short', day: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <StatusBadge status={internship.status} />
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">

                                                {/* Toggle */}
                                                <button
                                                    onClick={() => toggleStatus(internship._id)}
                                                    title={internship.status === 'Hiring' ? 'Close Posting' : 'Re-open Posting'}
                                                    className={`w-8 h-8 flex items-center justify-center rounded-lg border font-medium transition-all duration-200 ${internship.status === 'Hiring'
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                                                        : 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100'
                                                        }`}
                                                >
                                                    <Power className="w-4 h-4" />
                                                </button>

                                                {/* Edit */}
                                                <Link href={`/employer/internships/${internship._id}/edit`}>
                                                    <button title="Edit"
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg border bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100 transition-all duration-200">
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                </Link>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => openDel(internship)}
                                                    title="Delete"
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg border bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-all duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
