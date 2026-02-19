'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, User, Building, FileText, ExternalLink, Calendar, Search } from 'lucide-react';

export default function AdminVerifications() {
    const { user, loading } = useAuth();
    const [verifications, setVerifications] = useState([]);
    const [filter, setFilter] = useState('all'); // all, student, employer
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (!loading && user && user.role === 'admin') fetchVerifications();
    }, [user, loading]);

    const fetchVerifications = async () => {
        try {
            const { data } = await axios.get('/api/verification/pending');
            setVerifications(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAction = async (id, action) => {
        if (action === 'reject' && !confirm('Reject this user?')) return;
        try {
            await axios.put(`/api/verification/${id}/${action}`);
            setVerifications(prev => prev.filter(v => v._id !== id));
        } catch (err) {
            alert(`Failed to ${action}`);
        }
    };

    const filteredVerifications = verifications.filter(v => {
        const matchesFilter = filter === 'all' || v.role === filter;
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Dashboard...</div>;
    if (!user || user.role !== 'admin') return <div className="p-8 text-center text-red-500">Access Denied</div>;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Verification Dashboard</h1>
                        <p className="text-gray-500 mt-1">Review and approve user identities.</p>
                    </div>
                    <div className="flex items-center space-x-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        <button onClick={() => setFilter('all')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'all' ? 'bg-gray-900 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>All</button>
                        <button onClick={() => setFilter('student')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'student' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Students</button>
                        <button onClick={() => setFilter('employer')} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${filter === 'employer' ? 'bg-green-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}>Employers</button>
                    </div>
                </div>

                {/* Search */}
                <div className="relative pointer-events-auto">
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        className="w-full md:w-96 pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {filteredVerifications.map((v) => (
                            <motion.div
                                key={v._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                layout
                                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden group"
                            >
                                <div className={`h-2 w-full ${v.role === 'student' ? 'bg-indigo-500' : 'bg-green-500'}`}></div>

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center space-x-3">
                                            <div className={`p-2 rounded-lg ${v.role === 'student' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>
                                                {v.role === 'student' ? <User size={20} /> : <Building size={20} />}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 line-clamp-1">{v.name}</h3>
                                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{v.role}</p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md flex items-center">
                                            <Calendar size={12} className="mr-1" /> {new Date(v.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <p className="text-sm text-gray-600 flex items-center bg-gray-50 p-2 rounded-lg truncate">
                                            <span className="font-semibold mr-2">{v.role === 'student' ? 'ID:' : 'Reg:'}</span>
                                            {v.role === 'student' ? v.studentId : v.businessRegistrationNumber}
                                        </p>

                                        {v.role === 'employer' && (
                                            <p className="text-sm text-gray-600 flex items-center bg-gray-50 p-2 rounded-lg truncate">
                                                <span className="font-semibold mr-2">Company:</span> {v.companyName}
                                            </p>
                                        )}

                                        <a
                                            href={`${API_URL}/${v.role === 'student' ? v.studentIdImage : v.businessDocument}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center w-full py-2 px-4 rounded-xl border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-indigo-600 hover:border-indigo-300 transition-colors text-sm font-medium group-hover:border-indigo-200"
                                        >
                                            <FileText size={16} className="mr-2" /> View Document <ExternalLink size={14} className="ml-1 opacity-50" />
                                        </a>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleAction(v._id, 'reject')}
                                            className="flex items-center justify-center py-2.5 rounded-xl border border-red-100 text-red-600 hover:bg-red-50 font-medium text-sm transition-colors"
                                        >
                                            <X size={16} className="mr-2" /> Reject
                                        </button>
                                        <button
                                            onClick={() => handleAction(v._id, 'approve')}
                                            className="flex items-center justify-center py-2.5 rounded-xl bg-gray-900 text-white hover:bg-black font-medium text-sm transition-colors shadow-lg shadow-gray-200"
                                        >
                                            <Check size={16} className="mr-2" /> Approve
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {filteredVerifications.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                                <Check size={32} />
                            </div>
                            <h3 className="text-xl font-medium text-gray-900">All caught up!</h3>
                            <p className="text-gray-500 mt-2">No pending verification requests matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
