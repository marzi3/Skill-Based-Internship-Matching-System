'use client';

import React, { useState, useEffect } from 'react';
import axios from '@/services/apiClient';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    X, 
    User, 
    Building, 
    FileText, 
    ExternalLink, 
    Search,
    Filter,
    ArrowRight,
    Shield,
    AlertCircle,
    Info,
    ChevronRight,
    Loader2,
    Eye
} from 'lucide-react';

export default function AdminVerifications() {
    const { user, loading: authLoading } = useAuth();
    const [verifications, setVerifications] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [stats, setStats] = useState({ student: 0, employer: 0 });

    useEffect(() => {
        if (!authLoading && user?.role === 'admin') {
            fetchVerifications();
        }
    }, [user, authLoading]);

    const fetchVerifications = async () => {
        try {
            const { data } = await axios.get('/verification/pending');
            setVerifications(data);
            setStats({
                student: data.filter(v => v.role === 'student').length,
                employer: data.filter(v => v.role === 'employer').length
            });
            if (data.length > 0 && !selectedUser) {
                setSelectedUser(data[0]);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        }
    };

    const handleAction = async (id, action, reason = null) => {
        setIsProcessing(true);
        try {
            await axios.put(`/verification/${id}/${action}`, { reason });
            const updated = verifications.filter(v => v._id !== id);
            setVerifications(updated);
            
            // Auto-advance to next
            if (updated.length > 0) {
                setSelectedUser(updated[0]);
            } else {
                setSelectedUser(null);
            }
            setRejectionReason('');
        } catch (err) {
            alert(`Failed to ${action}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredVerifications = verifications.filter(v => {
        const matchesFilter = filter === 'all' || v.role === filter;
        const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              v.email?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (authLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>;
    if (!user || user.role !== 'admin') return <div className="p-20 text-center font-black text-rose-500 uppercase tracking-widest">Access Denied</div>;

    // Correctly derive the base URL (origin) from the API URL to serve static files
    const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001').replace('/api/v1', '').replace(/\/$/, '');

    const getImageUrl = (path) => {
        if (!path) return '';
        // If path already starts with http, return it
        if (path.startsWith('http')) return path;
        // Ensure path starts with / if it doesn't already
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${API_BASE}${cleanPath}`;
    };

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar List */}
            <div className="w-[400px] border-r border-slate-200 bg-white flex flex-col">
                <div className="p-6 border-b border-slate-100">
                    <h1 className="text-xl font-black text-slate-900 tracking-tight mb-4 flex items-center gap-2">
                        <Shield className="text-indigo-600 w-5 h-5" /> Verification Queue
                    </h1>
                    
                    <div className="relative mb-4">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input 
                            placeholder="Find application..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/10 outline-none"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 p-1 bg-slate-50 rounded-xl">
                        {['all', 'student', 'employer'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${filter === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {t} ({t === 'all' ? verifications.length : stats[t]})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <AnimatePresence>
                        {filteredVerifications.map(v => (
                            <motion.button
                                key={v._id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                onClick={() => setSelectedUser(v)}
                                className={`w-full text-left p-4 rounded-2xl transition-all border-2 ${selectedUser?._id === v._id ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-transparent hover:bg-slate-50'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${v.role === 'student' ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {v.role === 'student' ? <User size={18} /> : <Building size={18} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-slate-900 text-sm truncate">{v.name}</h4>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{v.role}</p>
                                    </div>
                                    <ChevronRight size={14} className={selectedUser?._id === v._id ? 'text-indigo-600' : 'text-slate-300'} />
                                </div>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                    
                    {filteredVerifications.length === 0 && (
                        <div className="text-center py-20 px-6">
                            <div className="bg-emerald-50 text-emerald-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check />
                            </div>
                            <h3 className="font-bold text-slate-900">Queue Empty</h3>
                            <p className="text-xs text-slate-400 mt-1">Excellent job! There are no pending requests matching your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Inspector Area */}
            <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
                <AnimatePresence mode="wait">
                    {selectedUser ? (
                        <motion.div 
                            key={selectedUser._id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 flex"
                        >
                            {/* Document Preview */}
                            <div className="flex-1 p-8 flex flex-col">
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 flex-1 relative overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                        <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                            <FileText size={14} /> DOCUMENT_PREVIEW
                                        </div>
                                        <a 
                                            href={getImageUrl(selectedUser.role === 'student' ? selectedUser.studentIdImage : selectedUser.businessDocument)}
                                            target="_blank"
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    </div>
                                    <div className="flex-1 bg-slate-200 flex items-center justify-center p-8 overflow-y-auto">
                                        <img 
                                            src={getImageUrl(selectedUser.role === 'student' ? selectedUser.studentIdImage : selectedUser.businessDocument)}
                                            alt="Verification Doc"
                                            className="max-w-full h-auto shadow-2xl rounded-lg"
                                            onError={(e) => { e.target.src = 'https://placehold.co/600x400?text=Scan+View'; }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Details & Actions Panel */}
                            <div className="w-[350px] bg-white border-l border-slate-200 p-8 overflow-y-auto space-y-8">
                                <header>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Review Record</h2>
                                    <p className="text-slate-400 text-sm font-medium">Application ID: {selectedUser._id.slice(-8).toUpperCase()}</p>
                                </header>

                                <div className="space-y-6">
                                    <section className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Information</label>
                                        <div className="bg-slate-50 p-4 rounded-2xl space-y-3">
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Legal Name</p>
                                                <p className="text-sm font-black text-slate-700">{selectedUser.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Account Email</p>
                                                <p className="text-sm font-black text-slate-700">{selectedUser.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Target ID/BRN</p>
                                                <p className="text-sm font-black text-indigo-600">
                                                    {selectedUser.role === 'student' ? selectedUser.studentId : selectedUser.businessRegistrationNumber}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="space-y-3 pt-4 border-t border-slate-100">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Decision Matrix</label>
                                        
                                        <div className="space-y-2">
                                            <button 
                                                disabled={isProcessing}
                                                onClick={() => handleAction(selectedUser._id, 'approve')}
                                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-lg flex items-center justify-center gap-2 group"
                                            >
                                                {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Shield size={16} />} 
                                                Approve & Certify
                                            </button>
                                            
                                            <div className="pt-4 space-y-3">
                                                <textarea 
                                                    placeholder="Reason for rejection (Optional)..."
                                                    value={rejectionReason}
                                                    onChange={(e) => setRejectionReason(e.target.value)}
                                                    className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500/10 outline-none transition-all resize-none"
                                                />
                                                <button 
                                                    disabled={isProcessing}
                                                    onClick={() => handleAction(selectedUser._id, 'reject', rejectionReason)}
                                                    className="w-full py-3 border border-rose-200 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
                                                >
                                                    {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <X size={16} />} 
                                                    Decline Record
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 text-amber-700">
                                    <AlertCircle size={32} className="flex-shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-wider">Security Notice</p>
                                        <p className="text-[10px] font-medium leading-relaxed mt-1 opacity-80">
                                            Verification decisions are final and will notify the user immediately. Ensure the document name matches the account profile.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                            <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6">
                                <Shield className="w-12 h-12 text-slate-200" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Select a case to begin</h2>
                            <p className="text-slate-500 max-w-xs mx-auto mt-2">Choose an application from the side panel to inspect documents and verify identities.</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
