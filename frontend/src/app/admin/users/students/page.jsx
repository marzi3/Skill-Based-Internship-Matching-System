'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import Cookies from 'js-cookie';
import { Search, MoreVertical, Trash2, Ban, CheckCircle, AlertCircle, RefreshCw, Loader2, UserX } from 'lucide-react';
import Badge from '@/components/common/Badge';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentManagement() {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setPages] = useState(1);

    // Action loading states
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchStudents();
    }, [page, statusFilter]);

    // Use debounced search manually for simplicity
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (page !== 1) setPage(1); // Reset page on new search
            else fetchStudents();
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            const res = await axios.get('http://localhost:5001/api/admin/students', {
                params: { page, limit: 12, search, status: statusFilter },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setStudents(res.data.data);
                setPages(res.data.pagination.pages);
            }
        } catch (error) {
            console.error('Failed to fetch students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (id, newStatus) => {
        setActionLoading(id);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.patch(`http://localhost:5001/api/admin/students/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Optimistic Update
            setStudents(students.map(s => s._id === id ? { ...s, status: newStatus } : s));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to update status');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you absolutely sure you want to PERMANENTLY delete this student account? This action cannot be undone.")) return;

        setActionLoading(id);
        try {
            const token = Cookies.get('token') || localStorage.getItem('token');
            await axios.delete(`http://localhost:5001/api/admin/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(students.filter(s => s._id !== id));
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to delete user');
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex gap-2">
                    <select
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl focus:ring-primary-500 focus:border-primary-500 block p-2.5 font-medium outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                        <option value="banned">Banned</option>
                    </select>

                    <button
                        onClick={fetchStudents}
                        className="p-2.5 bg-white border border-gray-200 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors shadow-sm"
                        title="Refresh Data"
                    >
                        <RefreshCw size={20} className={loading && !actionLoading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100 sticky top-0 backdrop-blur-sm z-10">
                            <tr>
                                <th className="px-6 py-4 font-bold tracking-wider">Student Name</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Email</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 font-bold tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading && !students.length ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-primary-500 mb-2" />
                                            Loading students...
                                        </div>
                                    </td>
                                </tr>
                            ) : students.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <UserX className="h-10 w-10 text-gray-300 mb-3" />
                                            <p className="font-medium text-lg text-gray-900">No students found</p>
                                            <p className="text-sm">Try adjusting your search criteria</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                students.map((student) => (
                                    <tr key={student._id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0 text-xs">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="font-bold text-gray-900">{student.name}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500 font-medium">
                                            {student.email}
                                        </td>
                                        <td className="px-6 py-3">
                                            <Badge variant={
                                                student.status === 'active' ? 'success' :
                                                    student.status === 'suspended' ? 'warning' : 'error'
                                            }>
                                                {student.status || 'active'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">
                                            {new Date(student.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2 transition-opacity">
                                                {student.status !== 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(student._id, 'active')}
                                                        disabled={actionLoading === student._id}
                                                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-200"
                                                        title="Activate"
                                                    >
                                                        {actionLoading === student._id ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                    </button>
                                                )}

                                                {student.status === 'active' && (
                                                    <button
                                                        onClick={() => handleStatusChange(student._id, 'suspended')}
                                                        disabled={actionLoading === student._id}
                                                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-transparent hover:border-orange-200"
                                                        title="Suspend"
                                                    >
                                                        {actionLoading === student._id ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />}
                                                    </button>
                                                )}

                                                <div className="w-px h-4 bg-gray-200 mx-1"></div>

                                                <button
                                                    onClick={() => handleDelete(student._id)}
                                                    disabled={actionLoading === student._id}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                    title="Permanently Delete"
                                                >
                                                    {actionLoading === student._id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
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
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <span className="text-sm text-gray-500 font-medium">
                            Page {page} of {totalPages}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-sm font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-700 shadow-sm"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 text-sm font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors text-gray-700 shadow-sm"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
