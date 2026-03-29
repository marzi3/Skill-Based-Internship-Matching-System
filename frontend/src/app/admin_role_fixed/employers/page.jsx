'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Search, Filter, CheckCircle, XCircle, Eye, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployersManagement() {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);

    // Filters and Pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Details Modal
    const [selectedEmployer, setSelectedEmployer] = useState(null);

    const fetchEmployers = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('/admin/employers', {
                headers: { Authorization: `Bearer ${token}` },
                params: { search: searchTerm, status: statusFilter, page, limit: 10 }
            });
            setEmployers(res.data.data);
            setTotalPages(res.data.pagination.pages);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Debounce search
        const delayDebounceFn = setTimeout(() => {
            fetchEmployers();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, statusFilter, page]);

    const handleUpdateStatus = async (id, newStatus) => {
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`/admin/employers/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Refresh list
            fetchEmployers();
            if (selectedEmployer && selectedEmployer._id === id) {
                setSelectedEmployer({ ...selectedEmployer, status: newStatus });
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you absolutely sure you want to PERMANENTLY delete this employer account and ALL of their internship postings? This action cannot be undone.")) return;

        setActionLoading(id);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setEmployers(employers.filter(e => e._id !== id));
            if (selectedEmployer && selectedEmployer._id === id) {
                setSelectedEmployer(null);
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="w-full h-full">
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Employer Accounts</h1>
                    <p className="text-gray-500 mt-1">Manage, approve and suspend employer access</p>
                </div>
            </div>

            <div className="glass p-6 rounded-2xl mb-8">
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by name, company, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Filter className="absolute left-3 top-3 text-gray-400" size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-10 pr-8 py-3 bg-gray-50 border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                        >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto overflow-y-auto max-h-[60vh] rounded-xl border border-gray-100 relative">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Joined</th>
                                <th className="px-6 py-3 text-xs font-black text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : employers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No employers found.</td>
                                </tr>
                            ) : (
                                employers.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-2">
                                            <div className="font-bold text-gray-900">{emp.companyName || 'Not Set'}</div>
                                            <div className="text-xs text-gray-500">Reg: {emp.businessRegistrationNumber || 'N/A'}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="font-medium text-gray-800 text-sm">{emp.name}</div>
                                            <div className="text-xs text-gray-500">{emp.email}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <div className="text-sm text-gray-700">{new Date(emp.createdAt).toLocaleDateString()}</div>
                                        </td>
                                        <td className="px-4 py-2">
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-bold rounded-md 
                        ${emp.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                    emp.status === 'suspended' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'}`}>
                                                {emp.status ? emp.status.charAt(0).toUpperCase() + emp.status.slice(1) : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2 text-right">
                                            <div className="flex justify-end gap-1">
                                                <button
                                                    onClick={() => setSelectedEmployer(emp)}
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                {emp.status !== 'approved' && (
                                                    <button
                                                        onClick={(e) => {
                                                            const btn = e.currentTarget;
                                                            btn.innerHTML = '<div class="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>';
                                                            handleUpdateStatus(emp._id, 'approved');
                                                        }}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors w-7 h-7 flex items-center justify-center"
                                                        title="Approve"
                                                    >
                                                        <CheckCircle size={16} />
                                                    </button>
                                                )}
                                                {emp.status !== 'suspended' && (
                                                    <button
                                                        onClick={(e) => {
                                                            const btn = e.currentTarget;
                                                            btn.innerHTML = '<div class="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>';
                                                            handleUpdateStatus(emp._id, 'suspended');
                                                        }}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-7 h-7 flex items-center justify-center"
                                                        title="Suspend"
                                                    >
                                                        {actionLoading === emp._id ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
                                                    </button>
                                                )}

                                                <div className="w-px h-4 bg-gray-200 mx-1 self-center"></div>

                                                <button
                                                    onClick={() => handleDelete(emp._id)}
                                                    disabled={actionLoading === emp._id}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200 flex items-center justify-center"
                                                    title="Permanently Delete"
                                                >
                                                    {actionLoading === emp._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedEmployer && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-xl font-bold text-gray-900">Employer Details</h3>
                                <button onClick={() => setSelectedEmployer(null)} className="text-gray-400 hover:text-gray-600">
                                    <XCircle size={24} />
                                </button>
                            </div>
                            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Company Name</span>
                                        <p className="font-medium text-gray-900">{selectedEmployer.companyName || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Status</span>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${selectedEmployer.status === 'approved' ? 'bg-green-100 text-green-800' : selectedEmployer.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {selectedEmployer.status ? selectedEmployer.status.charAt(0).toUpperCase() + selectedEmployer.status.slice(1) : 'Pending'}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Contact Name</span>
                                        <p className="font-medium text-gray-900">{selectedEmployer.name}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Contact Email</span>
                                        <p className="font-medium text-gray-900">{selectedEmployer.email}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Registration Number</span>
                                        <p className="font-medium text-gray-900">{selectedEmployer.businessRegistrationNumber || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <span className="text-sm text-gray-500 font-semibold block mb-1">Position</span>
                                        <p className="font-medium text-gray-900">{selectedEmployer.positionInCompany || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <span className="text-sm text-gray-500 font-semibold block mb-1">Company Description</span>
                                    <p className="font-medium text-gray-900 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        {selectedEmployer.companyDescription || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                                {selectedEmployer.status !== 'suspended' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedEmployer._id, 'suspended')}
                                        className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-semibold transition-colors"
                                    >
                                        Suspend Account
                                    </button>
                                )}
                                {selectedEmployer.status !== 'approved' && (
                                    <button
                                        onClick={() => handleUpdateStatus(selectedEmployer._id, 'approved')}
                                        className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-semibold transition-colors shadow-lg shadow-green-200"
                                    >
                                        Approve Account
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
