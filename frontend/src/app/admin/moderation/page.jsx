'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { ShieldAlert, Trash2, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ContentModeration() {
    const [flaggedListings, setFlaggedListings] = useState([]);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchModerationItems = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/admin/moderation', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFlaggedListings(res.data.data.flaggedListings || []);
            setReports(res.data.data.reports || []);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModerationItems();
    }, []);

    const handleRemoveListing = async (id) => {
        if (!confirm('Are you sure you want to remove this listing?')) return;
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`/admin/listings/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchModerationItems();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to remove listing');
        }
    };

    const handleResolveReport = async (id, status) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`/admin/moderation/reports/${id}`,
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchModerationItems();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to resolve report');
        }
    };

    return (
        <div className="w-full h-full">
            <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-rose-600 rounded-lg shadow-lg shadow-rose-600/20">
                            <ShieldAlert className="text-white w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-[0.3em]">System Level: Moderation</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight leading-none">Content Moderation <span className="text-rose-600">.</span></h1>
                    <p className="text-gray-500 font-bold mt-2">Security review for flagged listing protocols and user transmission reports</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Flagged Listings */}
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/60 backdrop-blur-xl p-8 rounded-[3rem] border border-white/50 shadow-xl">
                    <div className="flex items-center gap-4 mb-8 border-b border-gray-100 pb-6">
                        <div className="p-3 bg-rose-50 rounded-2xl text-rose-600">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 uppercase tracking-wide">Flagged Internship Protocols</h2>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Awaiting Security Clearance: {flaggedListings.length}</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto overflow-y-auto max-h-[40vh] border border-gray-100 rounded-xl relative">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Position & Company</th>
                                    <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Reason for Flag</th>
                                    <th className="px-4 py-3 text-xs font-black text-gray-500 uppercase">Date</th>
                                    <th className="px-4 py-3 text-right text-xs font-black text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr><td colSpan="4" className="text-center py-6 text-gray-500">Loading...</td></tr>
                                ) : flaggedListings.length === 0 ? (
                                    <tr><td colSpan="4" className="text-center py-6 text-gray-500">No flagged listings currently.</td></tr>
                                ) : (
                                    flaggedListings.map(listing => (
                                        <tr key={listing._id} className="hover:bg-gray-50/50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-gray-900 text-sm">{listing.positionTitle}</div>
                                                <div className="text-xs text-gray-500">{listing.company || listing.employer?.companyName}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="text-red-600 font-medium text-xs">{listing.flagReason || 'Reported by users'}</div>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500">
                                                {new Date(listing.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        const btn = e.currentTarget;
                                                        btn.innerHTML = '<div class="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>';
                                                        handleRemoveListing(listing._id);
                                                    }}
                                                    className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-semibold text-xs transition-colors flex items-center justify-center gap-2 w-full max-w-[100px] ml-auto h-8"
                                                >
                                                    <Trash2 size={14} /> Remove
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* User Reports */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <Clock className="text-orange-500" size={24} />
                        <h2 className="text-xl font-bold text-gray-900">User Reports</h2>
                        <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">{reports.length} pending</span>
                    </div>

                    <div className="grid gap-4">
                        {loading ? (
                            <div className="text-center py-6 text-gray-500">Loading...</div>
                        ) : reports.length === 0 ? (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-xl">No pending reports.</div>
                        ) : (
                            reports.map(report => (
                                <div key={report._id} className="bg-white border border-gray-100 p-5 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Report ID: {report._id.toString().substring(18)}</span>
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">{report.reportedEntity}</span>
                                        </div>
                                        <p className="text-gray-900 font-medium mb-1">
                                            <span className="text-gray-500">Reporter:</span> {report.reporterId?.name} ({report.reporterId?.email})
                                        </p>
                                        <p className="text-red-600 font-medium bg-red-50 p-3 rounded-lg mt-3 text-sm border border-red-100">
                                            "{report.reason}"
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2 mt-4 md:mt-0">
                                        <button
                                            onClick={() => handleResolveReport(report._id, 'dismissed')}
                                            className="px-4 py-2 border border-blue-200 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold text-sm transition-colors"
                                        >
                                            Dismiss Report
                                        </button>
                                        <button
                                            onClick={() => handleResolveReport(report._id, 'resolved')}
                                            className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle size={16} /> Mark Resolved
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
